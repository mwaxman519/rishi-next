import fs from &quot;fs&quot;;
import path from &quot;path&quot;;
import { compileMDX } from &quot;next-mdx-remote/rsc&quot;;
import remarkGfm from &quot;remark-gfm&quot;;
import rehypeSlug from &quot;rehype-slug&quot;;
import rehypeHighlight from &quot;rehype-highlight&quot;;
import { mdxComponents } from &quot;../components/docs/mdx-components&quot;;
import matter from &quot;gray-matter&quot;;
import crypto from &quot;crypto&quot;;

// Simple approach to provide fallbacks for MDX compilation errors
// This allows for safer deployment in cases where MDX files have issues

// Base directories for documentation
// Use root Docs directory for development, public/Docs for production
export const DOCS_DIRECTORY = process.env.VERCEL_ENV === 'production' 
  ? path.join(process.cwd(), &quot;public&quot;, &quot;Docs&quot;)
  : path.join(process.cwd(), &quot;Docs&quot;);

// Disable filesystem operations during static generation
const isStaticGeneration = process.env.NEXT_PHASE === 'phase-production-build' || 
                          process.env.BUILD_PHASE === 'static-generation';
const MARKDOWN_EXTENSIONS = [&quot;.md&quot;, &quot;.mdx&quot;];

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CONTENT_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours for content cache

// Debug logging utility
function debugLog(message: string, ...args: any[]) {
  if (
    process.env.NODE_ENV !== &quot;production&quot; ||
    process.env.DEBUG_DOCS === &quot;true&quot;
  ) {
    console.log(message, ...args);
  }
}

// Type definitions
export interface DocMetadata {
  title: string;
  description?: string;
  tags?: string[];
  lastUpdated?: Date;
}

export interface DocInfo {
  path: string;
  title: string;
  lastModified: Date;
  excerpt: string;
}

export type DocTree = { [key: string]: DocTree | null };

export interface DocContent {
  content: React.ReactNode;
  metadata: DocMetadata;
}

// Tree cache
let cachedDocTree: DocTree | null = null;
let cacheTimestamp: number = 0;
let lastContentHash: string = "&quot;;

/**
 * Calculate a hash of directory contents to detect changes
 */
function calculateDirectoryHash(dir: string): string {
  // Allow hash calculation for production runtime
  if (!fs.existsSync(dir)) {
    return &quot;directory-not-found&quot;;
  }
  
  const hashContent: string[] = [];

  function processDirectory(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden files
        if (entry.name.startsWith(&quot;.&quot;)) continue;

        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (
          entry.isFile() &&
          MARKDOWN_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
        ) {
          // Just add file names and modification times to the hash
          const stats = fs.statSync(fullPath);
          hashContent.push(`${fullPath}-${stats.mtime.getTime()}`);
        }
      }
    } catch (error) {
      debugLog(`Error processing directory ${currentDir} for hash:`, error);
    }
  }

  processDirectory(dir);

  // Generate a hash from the file information
  const contentStr = hashContent.sort().join(&quot;|&quot;);
  return crypto.createHash(&quot;md5&quot;).update(contentStr).digest(&quot;hex&quot;);
}

/**
 * Gets the document tree by recursively scanning the filesystem
 */
export async function getDocTree(): Promise<DocTree> {
  // Skip static generation check for production runtime - we need docs to work
  debugLog(&quot;[DOCS] Attempting to build document tree from filesystem&quot;);
  
  // Check if docs directory exists
  if (!fs.existsSync(DOCS_DIRECTORY)) {
    debugLog(`[DOCS] Directory not found: ${DOCS_DIRECTORY}`);
    
    // During production builds, return empty tree instead of throwing
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      debugLog(&quot;[DOCS] Production build - returning empty tree for missing directory&quot;);
      return {};
    }
    
    throw new Error(`Documentation directory not found: ${DOCS_DIRECTORY}`);
  }
  
  const currentTime = Date.now();

  // Check if cache is valid and not expired
  if (cachedDocTree && currentTime - cacheTimestamp < CACHE_TTL) {
    // Only recalculate hash in development or when explicitly requested
    if (process.env.NODE_ENV === &quot;production&quot; && !process.env.DEBUG_DOCS) {
      debugLog(&quot;[DOCS] Using cached document tree (production mode)&quot;);
      return cachedDocTree;
    }

    // In development, check if content has changed
    const newHash = calculateDirectoryHash(DOCS_DIRECTORY);
    if (newHash === lastContentHash) {
      debugLog(&quot;[DOCS] Using cached document tree (hash unchanged)&quot;);
      return cachedDocTree;
    }

    debugLog(&quot;[DOCS] Content hash changed, rebuilding tree&quot;);
    lastContentHash = newHash;
  } else {
    debugLog(&quot;[DOCS] Cache expired or empty, rebuilding tree&quot;);

    // Update hash for future comparisons
    if (process.env.NODE_ENV !== &quot;production&quot; || process.env.DEBUG_DOCS) {
      lastContentHash = calculateDirectoryHash(DOCS_DIRECTORY);
    }
  }

  try {
    debugLog(`[DOCS] Building document tree from: ${DOCS_DIRECTORY}`);
    const tree = buildDocTree(DOCS_DIRECTORY);

    // Verify the tree has content
    if (!tree || Object.keys(tree).length === 0) {
      throw new Error(&quot;Generated empty document tree&quot;);
    }

    // Update cache
    cachedDocTree = tree;
    cacheTimestamp = currentTime;

    debugLog(&quot;[DOCS] Successfully built document tree from filesystem&quot;);
    debugLog(`[DOCS] Tree contains ${Object.keys(tree).length} root items`);
    return tree;
  } catch (error) {
    console.error(&quot;Error building document tree:&quot;, error);

    // If we have a cached version, return it as fallback
    if (cachedDocTree) {
      console.log(&quot;[DOCS] Returning cached tree as fallback after error&quot;);
      return cachedDocTree;
    }

    throw error;
  }
}

/**
 * Recursively builds a document tree from a directory
 */
function buildDocTree(dir: string, baseDir: string = DOCS_DIRECTORY): DocTree {
  // Allow building tree for production runtime
  const tree: DocTree = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Separate directories and files for sorting
  const directories = entries.filter((entry) => entry.isDirectory());
  const files = entries.filter((entry) => entry.isFile());

  // Sort directories and files alphabetically
  directories.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));

  // Process directories first (alphabetically)
  for (const entry of directories) {
    // Skip hidden directories
    if (entry.name.startsWith(&quot;.&quot;)) continue;

    const fullPath = path.join(dir, entry.name);
    tree[entry.name] = buildDocTree(fullPath, baseDir);
  }

  // Then process files (alphabetically)
  for (const entry of files) {
    // Skip hidden files and non-markdown files
    if (entry.name.startsWith(&quot;.&quot;)) continue;
    if (!MARKDOWN_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
      continue;

    // Use the filename without extension as the key
    const key = path.parse(entry.name).name;
    tree[key] = null;
  }

  return tree;
}

/**
 * Gets recent documents by scanning the filesystem
 */
export async function getRecentDocuments(
  limit: number = 5,
): Promise<DocInfo[]> {
  try {
    debugLog(`[DOCS] Scanning for recent documents (limit: ${limit})`);
    const docsInfo: DocInfo[] = await getAllDocs();

    // Sort by last modified date, most recent first
    const sortedDocs = [...docsInfo].sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );

    // Limit the results
    const limitedDocs = sortedDocs.slice(0, limit);
    debugLog(`[DOCS] Found ${limitedDocs.length} recent documents`);

    return limitedDocs;
  } catch (error) {
    console.error(&quot;Error getting recent documents:&quot;, error);
    throw error;
  }
}

/**
 * Recursively finds all markdown documents in a directory
 */
function getAllDocsFromDirectory(
  dir: string,
  basePath: string = &quot;&quot;,
): DocInfo[] {
  const results: DocInfo[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith(&quot;.&quot;)) continue;

      // Recursively scan directories
      results.push(...getAllDocsFromDirectory(fullPath, relativePath));
    } else if (entry.isFile()) {
      // Skip hidden files and non-markdown files
      if (entry.name.startsWith(&quot;.&quot;)) continue;
      if (!MARKDOWN_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
        continue;

      try {
        // Get file stats for metadata
        const stats = fs.statSync(fullPath);

        // Read the file to get title and excerpt
        const content = fs.readFileSync(fullPath, &quot;utf-8&quot;);
        const { title, excerpt } = extractDocInfo(content, entry.name);

        // Create doc info object
        results.push({
          path: relativePath,
          title,
          lastModified: stats.mtime,
          excerpt,
        });
      } catch (error) {
        console.error(`Error processing document ${fullPath}:`, error);
        // Skip this file if there&apos;s an error
      }
    }
  }

  return results;
}

/**
 * Extract title and excerpt from markdown content
 */
function extractDocInfo(
  content: string,
  filename: string,
): { title: string; excerpt: string } {
  // Parse frontmatter if present
  const { data, content: markdownContent } = matter(content);

  // Get title from frontmatter or first heading
  let title = data.title || null;
  if (!title) {
    // Look for first heading
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1] && typeof titleMatch[1] === &quot;string&quot;) {
      title = titleMatch[1].trim();
    } else {
      // Fallback to filename
      title = path.parse(filename).name;
    }
  }

  // Get excerpt from frontmatter or first paragraph
  let excerpt = (data.description || data.excerpt || &quot;&quot;).toString();
  if (!excerpt) {
    // Look for first paragraph after headings and blank lines
    const excerptMatch = markdownContent
      .replace(/^#.*$/gm, &quot;&quot;) // Remove headings
      .match(/^\s*([^#\s].+?)\s*$/m); // Find first non-empty paragraph

    if (
      excerptMatch &&
      excerptMatch[1] &&
      typeof excerptMatch[1] === &quot;string&quot;
    ) {
      excerpt = excerptMatch[1].substring(0, 150);
      if (excerptMatch[1].length > 150) {
        excerpt += &quot;...&quot;;
      }
    } else {
      excerpt = &quot;&quot;;
    }
  }

  return { title, excerpt };
}

// Document content cache
interface CachedDocument {
  content: React.ReactNode;
  metadata: DocMetadata;
  timestamp: number;
  filePath: string;
  mtime: number;
}

const contentCache: Record<string, CachedDocument> = {};

/**
 * Gets a document by its path from the filesystem and compiles the MDX content
 */
// Import redirects from centralized file
import { DOC_PATH_REDIRECTS } from &quot;./doc-redirects&quot;;

// Use the imported redirects
const PATH_REDIRECTS = DOC_PATH_REDIRECTS;

export async function getDocumentByPath(
  docPath: string,
): Promise<DocContent | null> {
  // Return null during static generation to prevent filesystem access
  if (isStaticGeneration) {
    debugLog(&quot;[DOCS] Static generation mode - returning null for document&quot;);
    return null;
  }
  
  try {
    // First, clean up any existing extensions from the path
    // This ensures we never have double extensions in paths
    let cleanPath = docPath.replace(/\.(md|mdx)$/i, &quot;&quot;);

    // Normalize the path to handle various inputs, trimming slashes
    const normalizedPath = cleanPath.replace(/^\/+|\/+$/g, &quot;&quot;);

    // Log the input for debugging purposes
    console.log(
      `[DOCS REDIRECT DEBUG] Processing document request for path: '${docPath}', normalized to: '${normalizedPath}'`,
    );

    // Check if the normalized path is in our redirect mapping
    if (PATH_REDIRECTS[normalizedPath]) {
      // Log the redirection - use console.log for visibility regardless of debug setting
      console.log(
        `[DOCS REDIRECT] Redirecting from '${normalizedPath}' to '${PATH_REDIRECTS[normalizedPath]}'`,
      );

      // Get the document from the target path
      const redirectedDocument = await getDocumentByPath(
        PATH_REDIRECTS[normalizedPath],
      );

      // Log result of redirection
      if (redirectedDocument) {
        console.log(
          `[DOCS REDIRECT] Successfully retrieved redirected document with title: '${redirectedDocument.metadata.title}'`,
        );
      } else {
        console.log(`[DOCS REDIRECT] Failed to retrieve redirected document.`);
      }

      return redirectedDocument;
    }

    const cacheKey = normalizedPath;
    const currentTime = Date.now();

    debugLog(
      `[DOCS FETCH] Requesting content for: ${docPath} (normalized: ${normalizedPath})`,
    );

    // Check if we have a valid cached version
    if (
      contentCache[cacheKey] &&
      currentTime - contentCache[cacheKey].timestamp < CONTENT_CACHE_TTL
    ) {
      // In production, just use the cache
      if (process.env.NODE_ENV === &quot;production&quot; && !process.env.DEBUG_DOCS) {
        debugLog(
          `[DOCS FETCH] Using cached content for ${normalizedPath} (production mode)`,
        );
        return {
          content: contentCache[cacheKey].content,
          metadata: contentCache[cacheKey].metadata,
        };
      }

      // In development, check if the file has been modified
      try {
        const cachedFilePath = contentCache[cacheKey].filePath;
        const stats = fs.statSync(cachedFilePath);

        // If file hasn&apos;t been modified since caching, use the cache
        if (stats.mtime.getTime() === contentCache[cacheKey].mtime) {
          debugLog(
            `[DOCS FETCH] Using cached content for ${normalizedPath} (unchanged)`,
          );
          return {
            content: contentCache[cacheKey].content,
            metadata: contentCache[cacheKey].metadata,
          };
        } else {
          debugLog(
            `[DOCS FETCH] File has been modified, recompiling: ${cachedFilePath}`,
          );
        }
      } catch (err) {
        debugLog(
          `[DOCS FETCH] Error checking file modification, will recompile: ${err}`,
        );
      }
    }

    // Try different file extensions
    let filePath: string | null = null;
    const pathVariations: string[] = [];

    // Always try all possible extensions in order
    for (const ext of MARKDOWN_EXTENSIONS) {
      const candidatePath = path.join(
        DOCS_DIRECTORY,
        `${normalizedPath}${ext}`,
      );
      pathVariations.push(candidatePath);

      debugLog(`[DOCS FETCH] Checking path: ${candidatePath}`);
      if (fs.existsSync(candidatePath)) {
        debugLog(`[DOCS FETCH] Found file with extension: ${candidatePath}`);
        filePath = candidatePath;
        break;
      }
    }

    // If we didn&apos;t find a file with extensions, try as directory index
    if (!filePath) {
      for (const ext of MARKDOWN_EXTENSIONS) {
        const indexPath = path.join(
          DOCS_DIRECTORY,
          normalizedPath,
          `index${ext}`,
        );
        pathVariations.push(indexPath);
        if (fs.existsSync(indexPath)) {
          debugLog(`[DOCS FETCH] Found as directory index: ${indexPath}`);
          filePath = indexPath;
          break;
        }
      }
    }

    // If we didn&apos;t find a file with one of the extensions or as an index, try as README
    if (!filePath) {
      for (const ext of MARKDOWN_EXTENSIONS) {
        const readmePath = path.join(
          DOCS_DIRECTORY,
          normalizedPath,
          `README${ext}`,
        );
        pathVariations.push(readmePath);
        if (fs.existsSync(readmePath)) {
          debugLog(`[DOCS FETCH] Found as directory README: ${readmePath}`);
          filePath = readmePath;
          break;
        }
      }
    }

    // If we still don&apos;t have a file path, the document doesn&apos;t exist
    if (!filePath) {
      console.error(`[DOCS FETCH] Document not found: ${docPath}`);
      console.error(
        `[DOCS FETCH] Tried these paths: ${pathVariations.join(&quot;, &quot;)}`,
      );
      return null;
    }

    // Read the file content
    const source = fs.readFileSync(filePath, &quot;utf-8&quot;);

    // Get file stats for metadata
    const stats = fs.statSync(filePath);

    // Parse frontmatter
    const { data, content } = matter(source);

    // Extract title from frontmatter or first heading
    let title = data.title || null;
    if (!title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1] && typeof titleMatch[1] === &quot;string&quot;) {
        title = titleMatch[1].trim();
      } else {
        // Fallback to filename
        title = path.parse(filePath).name;
      }
    }

    // Extract and format description and tags
    const description = data.description || data.excerpt || undefined;
    let tags: string[] = [];
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        tags = data.tags;
      } else if (typeof data.tags === &quot;string&quot;) {
        tags = data.tags.split(&quot;,&quot;).map((tag: string) => tag.trim());
      }
    }

    // Build metadata object
    const metadata: DocMetadata = {
      title,
      description,
      tags,
      lastUpdated: stats.mtime,
    };

    debugLog(`[DOCS FETCH] Compiling MDX content for ${docPath}`);

    // Compile the MDX content
    try {
      // Apply basic sanitization to the source content
      const sanitizedSource = source
        // Replace problematic characters that could be confused with JSX
        .replace(/</g, &quot;&lt;&quot;)
        .replace(/>/g, &quot;&gt;&quot;);

      const { content: compiledContent } = await compileMDX({
        source: sanitizedSource,
        components: mdxComponents,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeHighlight],
          },
        },
      });

      debugLog(`[DOCS FETCH] Successfully compiled MDX content for ${docPath}`);

      // Cache the result
      contentCache[cacheKey] = {
        content: compiledContent,
        metadata,
        timestamp: currentTime,
        filePath,
        mtime: stats.mtime.getTime(),
      };

      return { content: compiledContent, metadata };
    } catch (mdxError) {
      console.error(`[DOCS FETCH] Error compiling MDX content:`, mdxError);

      // Instead of throwing an error, provide a fallback as plain text
      debugLog(
        `[DOCS FETCH] Using fallback plain text rendering for ${docPath}`,
      );

      // Use simple string concatenation to build the HTML
      // This avoids JSX compilation issues during the build process
      const errorContent = `
        <div class=&quot;doc-content-error&quot;>
          <div class=&quot;bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6&quot;>
            <p class=&quot;text-red-700 dark:text-red-400 font-medium&quot;>
              There was an error rendering this document. Showing plain content instead.
            </p>
            <p class=&quot;text-sm text-red-600 dark:text-red-300 mt-1&quot;>
              Error: ${mdxError instanceof Error ? mdxError.message : String(mdxError)}
            </p>
          </div>
          <div class=&quot;markdown-body&quot;>
            <pre class=&quot;whitespace-pre-wrap&quot;>${content.replace(/</g, &quot;&lt;&quot;).replace(/>/g, &quot;&gt;&quot;)}</pre>
          </div>
        </div>
      `;

      // Compile this simple HTML as MDX
      const { content: fallbackContent } = await compileMDX({
        source: errorContent,
        options: {
          parseFrontmatter: false,
        },
      });

      // Cache the fallback result
      contentCache[cacheKey] = {
        content: fallbackContent,
        metadata,
        timestamp: currentTime,
        filePath,
        mtime: stats.mtime.getTime(),
      };

      return {
        content: fallbackContent,
        metadata,
      };
    }
  } catch (error) {
    console.error(`Error fetching document ${docPath}:`, error);
    throw error;
  }
}

/**
 * Searches documents by query using cached document list
 */
export async function searchDocuments(query: string): Promise<DocInfo[]> {
  // Return empty array during static generation
  if (isStaticGeneration) {
    debugLog(&quot;[DOCS] Static generation mode - returning empty search results&quot;);
    return [];
  }
  
  if (!query.trim()) {
    return [];
  }

  try {
    debugLog(`[DOCS] Searching for documents matching: &quot;${query}&quot;`);
    const allDocs = await getAllDocs(); // Use cached document list
    const normalizedQuery = query.toLowerCase();

    // Simple search implementation that checks title, excerpt, and path
    const results = allDocs.filter((doc) => {
      return (
        doc.title.toLowerCase().includes(normalizedQuery) ||
        doc.excerpt.toLowerCase().includes(normalizedQuery) ||
        doc.path.toLowerCase().includes(normalizedQuery)
      );
    });

    debugLog(`[DOCS] Found ${results.length} documents matching: &quot;${query}&quot;`);
    return results;
  } catch (error) {
    console.error(&quot;Error searching documents:&quot;, error);
    throw error;
  }
}

// Cache for all documents
let cachedAllDocs: DocInfo[] | null = null;
let allDocsTimestamp: number = 0;
let allDocsDirectoryHash: string = &quot;&quot;;

/**
 * Gets all documents with caching
 */
export async function getAllDocs(): Promise<DocInfo[]> {
  // Return empty array during static generation
  if (isStaticGeneration) {
    debugLog(&quot;[DOCS] Static generation mode - returning empty document list&quot;);
    return [];
  }
  
  try {
    const currentTime = Date.now();

    // Check if cache is valid and not expired
    if (cachedAllDocs && currentTime - allDocsTimestamp < CACHE_TTL) {
      // In production, just use the cache
      if (process.env.NODE_ENV === &quot;production&quot; && !process.env.DEBUG_DOCS) {
        debugLog(&quot;[DOCS] Using cached document list (production mode)&quot;);
        return cachedAllDocs;
      }

      // In development, check if content has changed
      const newHash = calculateDirectoryHash(DOCS_DIRECTORY);
      if (newHash === allDocsDirectoryHash) {
        debugLog(&quot;[DOCS] Using cached document list (hash unchanged)&quot;);
        return cachedAllDocs;
      }

      debugLog(&quot;[DOCS] Document hash changed, rebuilding list&quot;);
      allDocsDirectoryHash = newHash;
    } else {
      debugLog(&quot;[DOCS] Cache expired or empty, rebuilding document list&quot;);

      // Update hash for future comparisons
      if (process.env.NODE_ENV !== &quot;production&quot; || process.env.DEBUG_DOCS) {
        allDocsDirectoryHash = calculateDirectoryHash(DOCS_DIRECTORY);
      }
    }

    // Get all documents by scanning the filesystem
    debugLog(&quot;[DOCS] Getting all documents from filesystem&quot;);
    const allDocs = getAllDocsFromDirectory(DOCS_DIRECTORY);

    // Update cache
    cachedAllDocs = allDocs;
    allDocsTimestamp = currentTime;

    debugLog(`[DOCS] Found ${allDocs.length} total documents`);
    return allDocs;
  } catch (error) {
    console.error(&quot;Error getting all documents:&quot;, error);

    // If we have a cached version, return it as fallback
    if (cachedAllDocs) {
      console.log(&quot;[DOCS] Returning cached documents as fallback after error&quot;);
      return cachedAllDocs;
    }

    throw error;
  }
}

// Cache for tag results - map of tag to document list
const tagCache: Record<string, { docs: DocInfo[]; timestamp: number }> = {};

/**
 * Gets documents by tag using cached document list when possible
 */
export async function getDocumentsByTag(tag: string): Promise<DocInfo[]> {
  // Return empty array during static generation
  if (isStaticGeneration) {
    debugLog(&quot;[DOCS] Static generation mode - returning empty tag results&quot;);
    return [];
  }
  
  const normalizedTag = tag.toLowerCase();
  const currentTime = Date.now();

  // Check tag cache first
  if (
    tagCache[normalizedTag] &&
    currentTime - tagCache[normalizedTag].timestamp < CACHE_TTL
  ) {
    debugLog(`[DOCS] Using cached results for tag: &quot;${normalizedTag}&quot;`);
    return tagCache[normalizedTag].docs;
  }

  try {
    debugLog(`[DOCS] Getting documents with tag: &quot;${normalizedTag}&quot;`);
    const allDocs = await getAllDocs(); // Use cached document list
    const results: DocInfo[] = [];

    // For each document, check if it has the requested tag
    // This could involve reading the actual files to parse frontmatter
    // which could still be slow, but we&apos;re using the cached doc list at least
    for (const doc of allDocs) {
      try {
        const filePath = findFilePath(path.join(DOCS_DIRECTORY, doc.path));
        if (!filePath) continue;

        const content = fs.readFileSync(filePath, &quot;utf-8&quot;);
        const { data } = matter(content);

        // Check if document has the requested tag
        if (data.tags) {
          const docTags = Array.isArray(data.tags)
            ? data.tags
            : data.tags.split(&quot;,&quot;).map((t: string) => t.trim());

          if (docTags.some((t: string) => t.toLowerCase() === normalizedTag)) {
            results.push(doc);
          }
        }
      } catch (error) {
        debugLog(
          `[DOCS] Error processing document ${doc.path} for tags:`,
          error,
        );
        // Skip this document if there&apos;s an error
      }
    }

    // Cache the results
    tagCache[normalizedTag] = {
      docs: results,
      timestamp: currentTime,
    };

    debugLog(
      `[DOCS] Found ${results.length} documents with tag: &quot;${normalizedTag}&quot;`,
    );
    return results;
  } catch (error) {
    console.error(`Error fetching documents by tag ${tag}:`, error);

    // If we have a cached version, return it as fallback
    if (tagCache[normalizedTag]) {
      console.log(
        `[DOCS] Returning cached tag results as fallback after error for &quot;${normalizedTag}&quot;`,
      );
      return tagCache[normalizedTag].docs;
    }

    throw error;
  }
}

/**
 * Helper function to find the actual file path with various extensions and formats
 */
function findFilePath(basePath: string): string | null {
  // Check if the base path is a file
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  // Try different extensions
  for (const ext of MARKDOWN_EXTENSIONS) {
    const pathWithExt = `${basePath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }

  // Try as a directory with index or README files
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of MARKDOWN_EXTENSIONS) {
      // Check for index file
      const indexPath = path.join(basePath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }

      // Check for README file
      const readmePath = path.join(basePath, `README${ext}`);
      if (fs.existsSync(readmePath)) {
        return readmePath;
      }
    }
  }

  return null;
}

/**
 * Helper function to convert a document path to a URL path
 */
export function docPathToUrlPath(docPath: string): string {
  // Remove extension
  const parsedPath = path.parse(docPath);
  let urlPath = path.join(parsedPath.dir, parsedPath.name);

  // Remove index and README from the end
  urlPath = urlPath.replace(/\/(index|README)$/i, &quot;/&quot;);

  // Ensure it starts with a slash
  if (!urlPath.startsWith(&quot;/&quot;)) {
    urlPath = &quot;/&quot; + urlPath;
  }

  return urlPath;
}

/**
 * Helper function to format a JSON error for more detailed logging/reporting
 */
function formatErrorDetails(error: any): string {
  if (!error) return &quot;Unknown error&quot;;

  try {
    // Check if it&apos;s a fetch Response object
    if (error.status && error.statusText) {
      return `Status: ${error.status} ${error.statusText}`;
    }

    // For regular errors
    let details = (error instanceof Error ? error.message : 'Unknown error') || &quot;No error details available&quot;;
    if (error instanceof Error && error.stack) {
      details += `\nStack: ${error.stack.split(&quot;\n&quot;)[0]}`;
    }

    return details;
  } catch (e) {
    return String(error);
  }
}
/**
 * Special debugging function to trace documentation path issues
 */
export function traceDocumentPath(docPath: string): string[] {
  const traces: string[] = [];

  try {
    traces.push(`Starting trace for document path: ${docPath}`);

    // Normalize the path
    const normalizedPath = docPath
      .replace(/^\/+|\/+$/g, &quot;&quot;)
      .replace(/\.(md|mdx)$/i, &quot;&quot;);
    traces.push(`Normalized path: ${normalizedPath}`);

    // Check if path is in redirects
    if (PATH_REDIRECTS[normalizedPath]) {
      traces.push(
        `Found redirect: ${normalizedPath} -> ${PATH_REDIRECTS[normalizedPath]}`,
      );
    } else {
      traces.push(`No redirect found for: ${normalizedPath}`);
    }

    // Check various file paths
    const pathVariations: string[] = [];

    // Try with extensions
    for (const ext of MARKDOWN_EXTENSIONS) {
      const candidatePath = path.join(
        DOCS_DIRECTORY,
        `${normalizedPath}${ext}`,
      );
      pathVariations.push(candidatePath);

      if (fs.existsSync(candidatePath)) {
        traces.push(`Found file: ${candidatePath}`);
      }
    }

    // Try as directory index
    for (const ext of MARKDOWN_EXTENSIONS) {
      const indexPath = path.join(
        DOCS_DIRECTORY,
        normalizedPath,
        `index${ext}`,
      );
      pathVariations.push(indexPath);
      if (fs.existsSync(indexPath)) {
        traces.push(`Found as directory index: ${indexPath}`);
      }
    }

    // Try as README
    for (const ext of MARKDOWN_EXTENSIONS) {
      const readmePath = path.join(
        DOCS_DIRECTORY,
        normalizedPath,
        `README${ext}`,
      );
      pathVariations.push(readmePath);
      if (fs.existsSync(readmePath)) {
        traces.push(`Found as directory README: ${readmePath}`);
      }
    }

    // If no file was found
    if (!pathVariations.some((p) => fs.existsSync(p))) {
      traces.push(
        `No matching file found. Tried: ${pathVariations.join(&quot;, ")}`,
      );
    }

    return traces;
  } catch (error) {
    traces.push(`Error tracing path: ${error}`);
    return traces;
  }
}
