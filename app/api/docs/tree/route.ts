import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import fs from &quot;fs/promises&quot;;
import * as nodePath from &quot;path&quot;;
import { getDocsDirectory } from &quot;@/lib/utils&quot;;

// Type definition for document tree
type DocTree = { [key: string]: DocTree | null };

/**
 * GET handler for document tree API
 * Returns the entire document structure as a tree
 * Throws real errors without fallbacks - this is intentional per user requirement
 */
export async function GET() {
  try {
    // Log the start of the process
    console.log(&quot;[DOCS TREE API] Starting to fetch document tree&quot;);

    // Get the tree without any fallbacks
    const tree = await getDocTree();

    // Verify it&apos;s not empty and throw detailed error if it is
    if (!tree || typeof tree !== &quot;object&quot;) {
      throw new Error(&quot;Document tree is null or not an object&quot;);
    }

    if (Object.keys(tree).length === 0) {
      throw new Error(&quot;Document tree is empty - no documents found&quot;);
    }

    // Log successful retrieval
    console.log(
      `[DOCS TREE API] Successfully retrieved document tree with ${Object.keys(tree).length} root entries`,
    );

    // Return the tree with cache-busting headers
    return NextResponse.json(tree, {
      headers: {
        &quot;Cache-Control&quot;: &quot;no-store, must-revalidate&quot;,
        Pragma: &quot;no-cache&quot;,
        Expires: &quot;0&quot;,
      },
    });
  } catch (error) {
    // Log detailed error information
    console.error(&quot;[DOCS TREE API] Failed to retrieve document tree:&quot;, error);
    console.error(
      &quot;[DOCS TREE API] Error details:&quot;,
      error instanceof Error ? error.stack : &quot;Unknown error&quot;,
    );

    // Return error with status code and detailed message
    return NextResponse.json(
      {
        error: &quot;Failed to retrieve document tree&quot;,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Recursively builds a document tree from the Docs directory
 * Ensures the tree structure mirrors the physical file structure
 * Sorts directories first alphabetically, then files alphabetically
 *
 * @param dir Directory to scan (optional, will use docs directory if not provided)
 * @param currentPath Current path in the tree structure (for logging)
 */
async function getDocTree(
  dir?: string,
  currentPath: string = &quot;/&quot;,
): Promise<DocTree> {
  // If dir is not provided, get the docs directory
  if (!dir) {
    dir = await getDocsDirectory();
    console.log(
      `[DOCS TREE] Starting tree scan at root docs directory: ${dir}`,
    );
  }

  const tree: DocTree = {};

  try {
    // First collect all items in the directory
    const allItems = await fs.readdir(dir);
    console.log(
      `[DOCS TREE] Found ${allItems.length} items in ${dir} (path: ${currentPath})`,
    );

    const filteredItems = allItems.filter((item) => !item.startsWith(&quot;.&quot;));
    console.log(
      `[DOCS TREE] After filtering hidden items: ${filteredItems.length} items remain`,
    );

    // Show sample of items
    if (filteredItems.length > 0) {
      const sample = filteredItems.slice(0, Math.min(10, filteredItems.length));
      console.log(`[DOCS TREE] Sample items: ${sample.join(&quot;, &quot;)}`);
    }

    // Separate directories and files
    const directories: string[] = [];
    const files: string[] = [];

    for (const item of filteredItems) {
      const itemPath = nodePath.join(dir, item);

      try {
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          console.log(`[DOCS TREE] Found directory: ${item} at ${itemPath}`);
          directories.push(item);
        } else if (
          stat.isFile() &&
          (item.endsWith(&quot;.md&quot;) || item.endsWith(&quot;.mdx&quot;))
        ) {
          console.log(`[DOCS TREE] Found file: ${item} at ${itemPath}`);
          files.push(item);
        } else {
          console.log(`[DOCS TREE] Skipping non-markdown file: ${item}`);
        }
      } catch (statError) {
        console.error(`[DOCS TREE] Error stating file ${itemPath}:`, statError);
      }
    }

    console.log(
      `[DOCS TREE] Directory ${dir} contains ${directories.length} directories and ${files.length} markdown files`,
    );

    // Sort directories and files alphabetically
    directories.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => {
      // Always put README files first
      if (a === &quot;README.md&quot; || a === &quot;README.mdx&quot;) return -1;
      if (b === &quot;README.md&quot; || b === &quot;README.mdx&quot;) return 1;
      return a.localeCompare(b);
    });

    // Debug logging for important paths
    if (
      dir.includes(&quot;api/endpoints&quot;) ||
      currentPath.includes(&quot;api/endpoints&quot;)
    ) {
      console.log(`[DOCS TREE] 🔍 ENDPOINTS DIRECTORY SCAN - ${dir}`);
      console.log(
        `[DOCS TREE] 🔍 Found ${files.length} endpoint files: ${files.join(&quot;, &quot;)}`,
      );
    }

    // Process directories first
    for (const directory of directories) {
      const itemPath = nodePath.join(dir, directory);
      const nextPath =
        currentPath === &quot;/&quot; ? `/${directory}` : `${currentPath}/${directory}`;
      const subtree = await getDocTree(itemPath, nextPath);
      tree[directory] = subtree;
    }

    // Then process files
    for (const file of files) {
      tree[file] = null; // null indicates this is a file, not a directory
    }

    // Final tree size for this level
    console.log(
      `[DOCS TREE] Tree for ${dir} contains ${Object.keys(tree).length} entries`,
    );

    // Check for empty tree and provide detailed warning (but don&apos;t use fallbacks)
    if (currentPath === &quot;/&quot; && Object.keys(tree).length < 3) {
      console.warn(`[DOCS TREE] ⚠️ Root tree has fewer than 3 entries`);
      console.warn(`[DOCS TREE] Documentation may be incomplete or missing`);

      // If completely empty, throw detailed error
      if (Object.keys(tree).length === 0) {
        throw new Error(
          `Empty document tree - no documents found in directory: ${dir}`,
        );
      }
    }

    // Log warning for endpoints directory without fallback
    if (currentPath.includes(&quot;/api/endpoints&quot;) && files.length < 3) {
      console.warn(
        `[DOCS TREE] ⚠️ Endpoints directory has very few files (${files.length})`,
      );
      console.warn(`[DOCS TREE] API documentation appears to be incomplete`);
    }

    return tree;
  } catch (error) {
    // Rethrow with more context for better debugging
    const detailedError = new Error(
      `Error building document tree for ${dir} (path: ${currentPath}): ${error instanceof Error ? error.message : String(error)}`,
    );
    if (error instanceof Error && error.stack) {
      detailedError.stack = error.stack;
    }

    console.error(
      `[DOCS TREE] ❌ Error building document tree for ${dir}:`,
      detailedError,
    );
    throw detailedError;
  }
}

/**
 * Provides a comprehensive fallback tree for the endpoints directory
 */
function getEndpointsFallbackTree(): DocTree {
  return {
    &quot;README.md&quot;: null,
    &quot;auth.md&quot;: null,
    &quot;availability.md&quot;: null,
    &quot;certifications.md&quot;: null,
    &quot;docs.md&quot;: null,
    &quot;employees.md&quot;: null,
    &quot;facilities.md&quot;: null,
    &quot;healthcheck.md&quot;: null,
    &quot;items.md&quot;: null,
    &quot;products.md&quot;: null,
    &quot;shifts.md&quot;: null,
    &quot;status.md&quot;: null,
    &quot;sync.md&quot;: null,
    &quot;time-entries.md&quot;: null,
    &quot;users.md&quot;: null,
  };
}

/**
 * Provides a fallback document tree for the entire docs structure
 */
function getFallbackDocTree(): DocTree {
  return {
    &quot;README.md&quot;: null,
    &quot;0-Project-Overview.md&quot;: null,
    &quot;1-TypeScript-Guidelines.md&quot;: null,
    &quot;2-Build-Optimization.md&quot;: null,
    &quot;3-Database-Best-Practices.md&quot;: null,
    &quot;4-CI-CD-and-Deployment.md&quot;: null,
    api: {
      &quot;README.md&quot;: null,
      &quot;authentication.md&quot;: null,
      &quot;overview.md&quot;: null,
      &quot;error-handling.md&quot;: null,
      &quot;rate-limiting.md&quot;: null,
      &quot;versioning.md&quot;: null,
      &quot;security.md&quot;: null,
      endpoints: getEndpointsFallbackTree(),
    },
    architecture: {
      &quot;README.md&quot;: null,
      &quot;system-architecture.md&quot;: null,
      &quot;components.md&quot;: null,
      &quot;data-flow.md&quot;: null,
      &quot;database-schema.md&quot;: null,
      &quot;authentication-flow.md&quot;: null,
      &quot;integration-patterns.md&quot;: null,
      &quot;event-bus-system.md&quot;: null,
      &quot;microservices.md&quot;: null,
      &quot;tech-stack.md&quot;: null,
    },
    &quot;development-guides&quot;: {
      &quot;README.md&quot;: null,
      &quot;getting-started.md&quot;: null,
      &quot;contributing.md&quot;: null,
      &quot;coding-standards.md&quot;: null,
      &quot;documentation-system.md&quot;: null,
    },
    features: {
      &quot;README.md&quot;: null,
      &quot;calendar.md&quot;: null,
      &quot;availability.md&quot;: null,
      &quot;scheduling.md&quot;: null,
      &quot;documentation.md&quot;: null,
      &quot;search.md&quot;: null,
      &quot;user-management.md&quot;: null,
    },
    &quot;getting-started&quot;: {
      &quot;README.md&quot;: null,
      &quot;installation.md&quot;: null,
      &quot;configuration.md&quot;: null,
      &quot;first-steps.md&quot;: null,
      &quot;quickstart.md&quot;: null,
    },
  };
}
