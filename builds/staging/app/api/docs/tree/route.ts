import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import fs from "fs/promises";
import * as nodePath from "path";
import { getDocsDirectory } from "@/lib/server-utils";

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
    console.log("[DOCS TREE API] Starting to fetch document tree");

    // Get the tree without any fallbacks
    const tree = await getDocTree();

    // Verify it's not empty and throw detailed error if it is
    if (!tree || typeof tree !== "object") {
      throw new Error("Document tree is null or not an object");
    }

    if (Object.keys(tree).length === 0) {
      throw new Error("Document tree is empty - no documents found");
    }

    // Log successful retrieval
    console.log(
      `[DOCS TREE API] Successfully retrieved document tree with ${Object.keys(tree).length} root entries`,
    );

    // Return the tree with cache-busting headers
    return NextResponse.json(tree, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // Log detailed error information
    console.error("[DOCS TREE API] Failed to retrieve document tree:", error);
    console.error(
      "[DOCS TREE API] Error details:",
      error instanceof Error ? error.stack : "Unknown error",
    );

    // Return error with status code and detailed message
    return NextResponse.json(
      {
        error: "Failed to retrieve document tree",
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
  currentPath: string = "/",
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

    const filteredItems = allItems.filter((item) => !item.startsWith("."));
    console.log(
      `[DOCS TREE] After filtering hidden items: ${filteredItems.length} items remain`,
    );

    // Show sample of items
    if (filteredItems.length > 0) {
      const sample = filteredItems.slice(0, Math.min(10, filteredItems.length));
      console.log(`[DOCS TREE] Sample items: ${sample.join(", ")}`);
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
          (item.endsWith(".md") || item.endsWith(".mdx"))
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
      if (a === "README.md" || a === "README.mdx") return -1;
      if (b === "README.md" || b === "README.mdx") return 1;
      return a.localeCompare(b);
    });

    // Debug logging for important paths
    if (
      dir.includes("api/endpoints") ||
      currentPath.includes("api/endpoints")
    ) {
      console.log(`[DOCS TREE] 🔍 ENDPOINTS DIRECTORY SCAN - ${dir}`);
      console.log(
        `[DOCS TREE] 🔍 Found ${files.length} endpoint files: ${files.join(", ")}`,
      );
    }

    // Process directories first
    for (const directory of directories) {
      const itemPath = nodePath.join(dir, directory);
      const nextPath =
        currentPath === "/" ? `/${directory}` : `${currentPath}/${directory}`;
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

    // Check for empty tree and provide detailed warning (but don't use fallbacks)
    if (currentPath === "/" && Object.keys(tree).length < 3) {
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
    if (currentPath.includes("/api/endpoints") && files.length < 3) {
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
    "README.md": null,
    "auth.md": null,
    "availability.md": null,
    "certifications.md": null,
    "docs.md": null,
    "employees.md": null,
    "facilities.md": null,
    "healthcheck.md": null,
    "items.md": null,
    "products.md": null,
    "shifts.md": null,
    "status.md": null,
    "sync.md": null,
    "time-entries.md": null,
    "users.md": null,
  };
}

/**
 * Provides a fallback document tree for the entire docs structure
 */
function getFallbackDocTree(): DocTree {
  return {
    "README.md": null,
    "0-Project-Overview.md": null,
    "1-TypeScript-Guidelines.md": null,
    "2-Build-Optimization.md": null,
    "3-Database-Best-Practices.md": null,
    "4-CI-CD-and-Deployment.md": null,
    api: {
      "README.md": null,
      "authentication.md": null,
      "overview.md": null,
      "error-handling.md": null,
      "rate-limiting.md": null,
      "versioning.md": null,
      "security.md": null,
      endpoints: getEndpointsFallbackTree(),
    },
    architecture: {
      "README.md": null,
      "system-architecture.md": null,
      "components.md": null,
      "data-flow.md": null,
      "database-schema.md": null,
      "authentication-flow.md": null,
      "integration-patterns.md": null,
      "event-bus-system.md": null,
      "microservices.md": null,
      "tech-stack.md": null,
    },
    "development-guides": {
      "README.md": null,
      "getting-started.md": null,
      "contributing.md": null,
      "coding-standards.md": null,
      "documentation-system.md": null,
    },
    features: {
      "README.md": null,
      "calendar.md": null,
      "availability.md": null,
      "scheduling.md": null,
      "documentation.md": null,
      "search.md": null,
      "user-management.md": null,
    },
    "getting-started": {
      "README.md": null,
      "installation.md": null,
      "configuration.md": null,
      "first-steps.md": null,
      "quickstart.md": null,
    },
  };
}
