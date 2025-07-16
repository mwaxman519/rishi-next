import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { extractFirstParagraph, getDocsDirectory } from "@/lib/utils";

// Type definitions
interface DocInfo {
  path: string;
  title: string;
  lastModified: Date;
  excerpt: string;
  tags?: string[];
}

/**
 * GET handler for tagged documents API
 * Returns documents with the specified tag
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = (searchParams.get("tag") || undefined) || "";

    if (!tag.trim()) {
      return NextResponse.json([]);
    }

    const allDocs = await getAllDocs();
    const lowerTag = tag.toLowerCase();

    // Filter documents by tag
    const results = allDocs.filter((doc) =>
      doc.tags?.some((t) => t.toLowerCase() === lowerTag),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching documents by tag:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents by tag" },
      { status: 500 },
    );
  }
}

/**
 * Extracts title and tags from markdown content
 */
function getDocMetadata(content: string): {
  title: string | null;
  tags: string[] | undefined;
} {
  // Look for # Title
  const titleMatch = content.match(/^#\s+(.+)$/m);

  // Look for frontmatter
  const frontmatterMatch = content.match(/^---\s+([\s\S]*?)\s+---/);

  let title: string | null = null;
  let tags: string[] | undefined;

  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  if (frontmatterMatch && frontmatterMatch[1]) {
    const frontmatter = frontmatterMatch[1];

    // Extract title from frontmatter if not already found
    if (!title) {
      const frontmatterTitleMatch = frontmatter.match(/title:\s*(.+)(\n|$)/);
      if (frontmatterTitleMatch && frontmatterTitleMatch[1]) {
        title = frontmatterTitleMatch[1].trim();
      }
    }

    // Extract tags
    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch && tagsMatch[1]) {
      tags = tagsMatch[1]
        .split(",")
        .map((tag) => tag.trim().replace(/["']/g, ""))
        .filter((tag) => tag !== "");
    }
  }

  return { title, tags };
}

/**
 * Gets all documents with their tags
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

          // Extract metadata from content
          const { title, tags } = getDocMetadata(content);

          // Extract description from content
          const excerpt = extractFirstParagraph(content);

          docs.push({
            path: docRelativePath.replace(/\.(md|mdx)$/, ""),
            title:
              typeof title === "string"
                ? title
                : entry.name.replace(/\.(md|mdx)$/, "").replace(/-/g, " "),
            lastModified: stat.mtime,
            excerpt: excerpt || "No description available",
            tags: tags || [],
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
