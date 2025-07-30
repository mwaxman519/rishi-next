import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import fs from &quot;fs/promises&quot;;
import path from &quot;path&quot;;
// Using direct values instead of problematic imports
// import { extractFirstParagraph, getDocsDirectory } from &quot;@/lib/utils&quot;;

// Type definitions
interface DocMetadata {
  title: string;
  description: string;
  tags: string[] | undefined;
  lastUpdated: Date;
}

/**
 * GET handler for document content API
 * Returns the content and metadata for a specific document
 * Throws real errors without fallbacks - this is intentional per user requirement
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docPath = (searchParams.get(&quot;path&quot;) || undefined) || undefined;

    console.log(
      `[DOCS CONTENT API] Received request for document path: ${docPath}`,
    );
    console.log(
      `[DOCS CONTENT API] Environment: ${process.env.NODE_ENV || &quot;unknown&quot;}`,
    );
    console.log(
      `[DOCS CONTENT API] Current working directory: ${process.cwd()}`,
    );

    // If path is missing, return error
    if (!docPath) {
      return NextResponse.json(
        { error: &quot;Document path is required&quot; },
        { status: 400 },
      );
    }

    // Normalize path for consistency
    const normalizedPath = docPath.replace(/^\/+/, "&quot;);
    console.log(`[DOCS CONTENT API] Normalized path: ${normalizedPath}`);

    // List important Docs directory locations for debugging
    const docsDirectories = await findDocsDirectories();
    console.log(
      `[DOCS CONTENT API] Found ${docsDirectories.length} documentation directories`,
    );

    // Get all doc files directly for full diagnostic info
    const allDocFiles = await listAllDocumentFiles(docsDirectories);
    console.log(
      `[DOCS CONTENT API] Found ${allDocFiles.length} total doc files across all directories`,
    );

    if (allDocFiles.length > 0) {
      console.log(
        `[DOCS CONTENT API] First few doc files: ${allDocFiles.slice(0, 5).join(&quot;, &quot;)}`,
      );
    }

    // Get document content - no fallbacks
    const document = await getDocumentContent(normalizedPath);

    if (!document) {
      console.error(
        `[DOCS CONTENT API] Document not found for path: ${normalizedPath}`,
      );

      // Return detailed 404 with complete information
      return NextResponse.json(
        {
          error: &quot;Document not found&quot;,
          path: normalizedPath,
          searchedDirectories: docsDirectories,
          availableFiles:
            allDocFiles.length > 20 ? allDocFiles.slice(0, 20) : allDocFiles,
          totalFiles: allDocFiles.length,
          timestamp: new Date().toISOString(),
        },
        {
          status: 404,
          headers: {
            &quot;Cache-Control&quot;: &quot;no-cache, no-store, must-revalidate&quot;,
            Pragma: &quot;no-cache&quot;,
            Expires: &quot;0&quot;,
          },
        },
      );
    }

    console.log(
      `[DOCS CONTENT API] Successfully retrieved document for path: ${normalizedPath}`,
    );
    console.log(
      `[DOCS CONTENT API] Document title: ${document.metadata.title}`,
    );
    console.log(
      `[DOCS CONTENT API] Document content length: ${document.content.length} characters`,
    );

    // Add cache control headers to prevent caching
    return NextResponse.json(document, {
      headers: {
        &quot;Cache-Control&quot;: &quot;no-cache, no-store, must-revalidate&quot;,
        Pragma: &quot;no-cache&quot;,
        Expires: &quot;0&quot;,
      },
    });
  } catch (error) {
    console.error(`[DOCS CONTENT API] Error processing request:`, error);

    // Return detailed error information
    return NextResponse.json(
      {
        error: &quot;Error processing document request&quot;,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          &quot;Cache-Control&quot;: &quot;no-cache, no-store, must-revalidate&quot;,
          Pragma: &quot;no-cache&quot;,
          Expires: &quot;0&quot;,
        },
      },
    );
  }
}

/**
 * List all document files across all doc directories
 * Used for diagnostic info when document not found
 */
async function listAllDocumentFiles(directories: string[]): Promise<string[]> {
  const allFiles: string[] = [];

  for (const dir of directories) {
    try {
      await traverseDirectory(dir, &quot;&quot;);
    } catch (error) {
      console.error(
        `[DOCS CONTENT API] Error traversing directory ${dir}:`,
        error,
      );
    }
  }

  async function traverseDirectory(dir: string, relativePath: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files/directories
        if (entry.name.startsWith(&quot;.&quot;)) continue;

        const entryPath = path.join(dir, entry.name);
        const entryRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

        if (entry.isDirectory()) {
          // Recursively process directory
          await traverseDirectory(entryPath, entryRelativePath);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(&quot;.md&quot;) || entry.name.endsWith(&quot;.mdx&quot;))
        ) {
          // Add markdown files to the list
          allFiles.push(entryRelativePath);
        }
      }
    } catch (error) {
      // Just log error and continue
      console.error(
        `[DOCS CONTENT API] Error reading directory ${dir}:`,
        error,
      );
    }
  }

  return allFiles;
}

/**
 * Find all docs directories for debugging purposes
 */
async function findDocsDirectories(): Promise<string[]> {
  const possibleDirs = [
    path.join(process.cwd(), &quot;Docs&quot;),
    path.join(process.cwd(), &quot;docs&quot;),
    path.join(process.cwd(), &quot;docs-new&quot;),
    path.join(process.cwd(), &quot;public/Docs&quot;),
    &quot;/home/runner/Docs&quot;,
    &quot;/home/runner/workspace/Docs&quot;,
  ];

  const foundDirs: string[] = [];

  for (const dir of possibleDirs) {
    try {
      const exists = await fs
        .access(dir)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        const stats = await fs.stat(dir);
        if (stats.isDirectory()) {
          const files = await fs.readdir(dir);
          console.log(
            `[DOCS CONTENT API] Found directory ${dir} with ${files.length} files`,
          );
          foundDirs.push(dir);
        }
      }
    } catch (e) {
      console.log(`[DOCS CONTENT API] Error checking directory ${dir}: ${e}`);
    }
  }

  return foundDirs;
}

/**
 * Note: We've removed the direct document content API with hardcoded fallbacks
 * as per user requirement to expose true errors instead of using fallbacks
 */

/**
 * Extracts title from markdown content
 */
function getDocTitle(content: string): string | null {
  // Look for # Title or frontmatter title
  const titleMatch =
    content.match(/^#\s+(.+)$/m) ||
    content.match(/^---[\s\S]*?\ntitle:\s*(.+)\n[\s\S]*?---/);

  if (!titleMatch || !titleMatch[1]) {
    return null;
  }

  return titleMatch[1].trim();
}

/**
 * Gets a document by its path
 * Does not provide any fallbacks, returns null if document not found
 * Will throw errors directly as per user requirement
 */
async function getDocumentContent(
  docPath: string,
): Promise<{ content: string; metadata: DocMetadata } | null> {
  // Normalize the path - remove leading slashes and handle empty paths
  const normalizedPath = docPath.replace(/^\/+/, &quot;&quot;).trim();
  if (!normalizedPath) {
    console.log(`[DOCS CONTENT] Empty document path after normalization`);
    return null;
  }

  console.log(
    `[DOCS CONTENT] Looking for document: ${normalizedPath} (original: ${docPath})`,
  );

  // Get the main docs directory from the utility function
  const mainDocsDirectory = 'Docs'; // Direct value instead of function call
  console.log(
    `[DOCS CONTENT] Main docs directory from utility: ${mainDocsDirectory}`,
  );

  // Get current working directory and other base paths
  const cwd = process.cwd();
  const homedir = await getHomedir();

  // Create a comprehensive list of root directories to check, prioritizing the main docs directory
  const possibleRootDirs = [
    mainDocsDirectory,

    // Project root locations
    path.join(cwd, &quot;Docs&quot;),
    path.join(cwd, &quot;docs&quot;),
    path.join(cwd, &quot;docs-new&quot;),
    path.join(cwd, &quot;public/Docs&quot;),

    // Next.js-specific locations
    path.join(cwd, &quot;.next/standalone/Docs&quot;),
    path.join(cwd, &quot;.next/server/Docs&quot;),
    path.join(cwd, &quot;.next/static/Docs&quot;),
    path.join(cwd, &quot;.next/server/app/Docs&quot;),

    // Replit-specific locations
    &quot;/home/runner/Docs&quot;,
    &quot;/home/runner/workspace/Docs&quot;,
    &quot;/home/runner/workspace/public/Docs&quot;,

    // For Next.js standalone mode
    &quot;/home/runner/workspace/.next/standalone/Docs&quot;,
    &quot;/home/runner/workspace/.next/server/Docs&quot;,

    // Additional Replit locations
    &quot;/home/runner/workspace/.next/standalone/.next/server/app/Docs&quot;,
    &quot;/home/runner/workspace/.next/standalone/.next/server/chunks/Docs&quot;,

    // Deep standalone nesting
    path.join(cwd, &quot;../Docs&quot;),
    path.join(cwd, &quot;../../Docs&quot;),

    // Possible public directories in various environments
    &quot;/app/public/Docs&quot;,
    &quot;/public/Docs&quot;,
  ];

  // Deduplicate the paths using Set
  const uniqueRootDirs = [...new Set(possibleRootDirs)];
  console.log(
    `[DOCS CONTENT] Will search in ${uniqueRootDirs.length} unique root directories`,
  );

  // Handle variations of the path (with/without extensions)
  let filePath = normalizedPath;
  let fullFilePath = &quot;&quot;;
  let foundFile = false;

  // First, determine if the path includes a file extension
  const hasExtension =
    normalizedPath.endsWith(&quot;.md&quot;) || normalizedPath.endsWith(&quot;.mdx&quot;);

  // For paths without extensions, we'll try multiple variations but DON'T include .md in the path parameter
  const pathVariations = hasExtension
    ? [normalizedPath] // If it already has an extension, just use that
    : [
        normalizedPath, // Try exact path first
        `${normalizedPath}.md`, // Try with .md extension
        `${normalizedPath}.mdx`, // Try with .mdx extension
      ];

  // First pass: try to find the document as a direct file
  for (const rootDir of uniqueRootDirs) {
    // Skip invalid directories
    if (!rootDir) continue;

    for (const pathVar of pathVariations) {
      const possibleFilePath = path.join(rootDir, pathVar);

      try {
        const stat = await fs.stat(possibleFilePath);
        if (stat.isFile()) {
          console.log(`[DOCS CONTENT] ✅ Found file: ${possibleFilePath}`);
          fullFilePath = possibleFilePath;
          filePath = pathVar;
          foundFile = true;
          break;
        }
      } catch (error) {
        // File doesn&apos;t exist at this path, continue to next variation
      }
    }

    if (foundFile) break;
  }

  // Second pass: if no direct file match, check if it&apos;s a directory path looking for README
  if (!foundFile) {
    for (const rootDir of uniqueRootDirs) {
      // Skip invalid directories
      if (!rootDir) continue;

      const dirPath = path.join(rootDir, normalizedPath);

      try {
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          console.log(`[DOCS CONTENT] Path resolves to directory: ${dirPath}`);

          // This is a directory - try README files in various formats
          const readmeVariations = [
            path.join(dirPath, &quot;README.md&quot;),
            path.join(dirPath, &quot;README.mdx&quot;),
            path.join(dirPath, &quot;index.md&quot;),
            path.join(dirPath, &quot;index.mdx&quot;),
          ];

          for (const readmePath of readmeVariations) {
            try {
              const readmeStat = await fs.stat(readmePath);
              if (readmeStat.isFile()) {
                console.log(
                  `[DOCS CONTENT] ✅ Found directory index file: ${readmePath}`,
                );
                fullFilePath = readmePath;
                filePath = normalizedPath + &quot;/&quot; + path.basename(readmePath);
                foundFile = true;
                break;
              }
            } catch (error) {
              // This README variation doesn&apos;t exist, try next
            }
          }

          if (foundFile) break;
        }
      } catch (error) {
        // Not a directory or doesn&apos;t exist, continue to next root dir
      }
    }
  }

  // If still no file is found, we won&apos;t use fallbacks
  if (!foundFile || !fullFilePath) {
    console.log(
      `[DOCS CONTENT] ❌ Document not found after checking all possible locations: ${normalizedPath}`,
    );
    console.log(
      `[DOCS CONTENT] Checked these root directories:`,
      uniqueRootDirs,
    );
    return null;
  }

  // Read the found file
  console.log(`[DOCS CONTENT] Reading file content: ${fullFilePath}`);

  try {
    const content = await fs.readFile(fullFilePath, &quot;utf-8&quot;);
    const stat = await fs.stat(fullFilePath);

    console.log(
      `[DOCS CONTENT] Successfully read file, size: ${content.length} bytes`,
    );

    // Extract title from content
    const title =
      getDocTitle(content) || path.basename(filePath, path.extname(filePath));

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\s+([\s\S]*?)\s+---/);
    let description: string | undefined;
    let tags: string[] | undefined;
    let lastUpdated: Date | undefined;

    if (frontmatterMatch && frontmatterMatch[1]) {
      const frontmatter = frontmatterMatch[1];

      // Extract description
      const descriptionMatch = frontmatter.match(/description:\s*(.+)(\n|$)/);
      if (descriptionMatch && descriptionMatch[1]) {
        description = descriptionMatch[1].trim();
      }

      // Extract tags - support both array and comma-separated formats
      const tagsArrayMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
      const tagsLineMatch = frontmatter.match(/tags:\s*(.+)(\n|$)/);

      if (tagsArrayMatch && tagsArrayMatch[1]) {
        tags = tagsArrayMatch[1]
          .split(&quot;,&quot;)
          .map((tag) => tag.trim().replace(/[&quot;']/g, "&quot;));
      } else if (tagsLineMatch && tagsLineMatch[1]) {
        // This handles non-array format like &quot;tags: api, authentication&quot;
        tags = tagsLineMatch[1].split(&quot;,&quot;).map((tag) => tag.trim());
      }

      // Extract lastUpdated
      const lastUpdatedMatch = frontmatter.match(/lastUpdated:\s*(.+)(\n|$)/);
      if (lastUpdatedMatch && lastUpdatedMatch[1]) {
        lastUpdated = new Date(lastUpdatedMatch[1].trim());
      }
    }

    // If no description in frontmatter, extract from content
    if (!description) {
      const paragraphs = content.split('\n\n');
      description = paragraphs[0] || '';
    }

    // If no lastUpdated in frontmatter, use file mtime
    if (!lastUpdated) {
      lastUpdated = stat.mtime;
    }

    // Return the document with metadata
    return {
      content,
      metadata: {
        title,
        description,
        tags,
        lastUpdated,
      },
    };
  } catch (error) {
    // Let the error propagate up with detailed information
    console.error(`[DOCS CONTENT] Error reading file ${fullFilePath}:`, error);
    throw new Error(
      `Failed to read document ${docPath} (resolved to ${fullFilePath}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get the homedir in a way that works in various environments
 */
async function getHomedir(): Promise<string> {
  try {
    const os = await import(&quot;os&quot;);
    return os.homedir();
  } catch (error) {
    // Fallback for environments where os might not be available
    return &quot;/home/runner";
  }
}

// No endpoint template generation - we require real documentation files
// as per user requirement to avoid fallbacks
