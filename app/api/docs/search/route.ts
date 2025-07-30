import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import fs from &quot;fs/promises&quot;;
import path from &quot;path&quot;;
import { extractFirstParagraph, getDocsDirectory } from &quot;@/lib/utils&quot;;

// Type definitions
interface DocInfo {
  path: string;
  title: string;
  lastModified: Date;
  excerpt: string;
}

/**
 * GET handler for search documents API
 * Returns documents matching the search query
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get(&quot;q&quot;) || undefined) || "&quot;;

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const allDocs = await getAllDocs();
    const lowerQuery = query.toLowerCase();

    const results = allDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.excerpt.toLowerCase().includes(lowerQuery),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error(&quot;Error searching documents:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to search documents&quot; },
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
 * Gets all documents for searching
 */
async function getAllDocs(): Promise<DocInfo[]> {
  const docs: DocInfo[] = [];

  // Get the docs directory path
  const DOCS_DIRECTORY = await getDocsDirectory();

  async function traverseDir(dirPath: string, relativePath: string = &quot;&quot;) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(&quot;.&quot;)) continue;

      const fullPath = path.join(dirPath, entry.name);
      const docRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        await traverseDir(fullPath, docRelativePath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(&quot;.md&quot;) || entry.name.endsWith(&quot;.mdx&quot;))
      ) {
        try {
          const content = await fs.readFile(fullPath, &quot;utf-8&quot;);
          const stat = await fs.stat(fullPath);

          // Extract title from content or use filename
          const title =
            getDocTitle(content) ||
            entry.name.replace(/\.(md|mdx)$/, &quot;&quot;).replace(/-/g, &quot; &quot;);

          // Extract description from content
          const excerpt = extractFirstParagraph(content);

          docs.push({
            path: docRelativePath.replace(/\.(md|mdx)$/, &quot;&quot;),
            title: typeof title === &quot;string&quot; ? title : entry.name,
            lastModified: stat.mtime,
            excerpt: excerpt || &quot;No description available",
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
