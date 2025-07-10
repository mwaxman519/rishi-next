import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { extractFirstParagraph, getDocsDirectory } from "../../../../lib/utils";

// Type definitions
interface DocInfo {
  path: string;
  title: string;
  lastModified: Date;
  excerpt: string;
}

/**
 * GET handler for recent documents API
 * Returns a list of recent documents with metadata
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const recentDocs = await getRecentDocuments(limit);
    return NextResponse.json(recentDocs);
  } catch (error) {
    console.error("Error getting recent documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve recent documents" },
      { status: 500 },
    );
  }
}

/**
 * Extracts title from markdown content
 */
function getDocTitle(content: string): string | null {
  // Look for # Title or frontmatter title
  const titleMatch =
    content.match(/^#\s+(.+)$/m) ||
    content.match(/^---[\s\S]*?\ntitle:\s*(.+)\n[\s\S]*?---/);

  return titleMatch && titleMatch[1] ? titleMatch[1].trim() : null;
}

/**
 * Gets all documents, sorted by last modified date
 */
async function getAllDocs(): Promise<DocInfo[]> {
  const docs: DocInfo[] = [];

  // Get the docs directory path
  const DOCS_DIRECTORY = await getDocsDirectory();

  async function traverseDir(dirPath: string, relativePath: string = "") {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(dirPath, entry.name);
      const docRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        await traverseDir(fullPath, docRelativePath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
      ) {
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const stat = await fs.stat(fullPath);

          // Extract title from content or use filename
          const title =
            getDocTitle(content) ||
            entry.name.replace(/\.(md|mdx)$/, "").replace(/-/g, " ");

          // Extract description from content
          const excerpt = extractFirstParagraph(content);

          docs.push({
            path: docRelativePath.replace(/\.(md|mdx)$/, ""),
            title: typeof title === "string" ? title : entry.name,
            lastModified: stat.mtime,
            excerpt: excerpt || "No description available",
          });
        } catch (error) {
          console.error(`Error processing document ${fullPath}:`, error);
        }
      }
    }
  }

  await traverseDir(DOCS_DIRECTORY);

  // Sort by last modified date (most recent first)
  return docs.sort(
    (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
  );
}

/**
 * Gets the most recently modified documents
 */
async function getRecentDocuments(limit: number = 5): Promise<DocInfo[]> {
  const allDocs = await getAllDocs();
  return allDocs.slice(0, limit);
}
