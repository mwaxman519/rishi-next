import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import fs from &quot;fs&quot;;
import path from &quot;path&quot;;
import * as marked from &quot;marked&quot;;

// Find Docs directory in various potential locations
function findDocsDirectory(): string | null {
  const baseDir = process.cwd();
  const possiblePaths = [
    path.join(baseDir, &quot;Docs&quot;),
    path.join(baseDir, &quot;docs&quot;),
    path.join(baseDir, &quot;public&quot;, &quot;Docs&quot;),
    path.join(baseDir, &quot;public&quot;, &quot;docs&quot;),
    path.join(baseDir, &quot;.next&quot;, &quot;standalone&quot;, &quot;Docs&quot;),
    path.join(baseDir, &quot;.next&quot;, &quot;server&quot;, &quot;Docs&quot;),
    &quot;/home/runner/Docs&quot;,
    &quot;/home/runner/workspace/Docs&quot;,
    &quot;/Docs&quot;,
  ];

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      try {
        // Make sure we can read from the directory
        fs.readdirSync(dirPath);
        return dirPath;
      } catch (e) {
        // Directory exists but we can&apos;t read from it
        console.error(`Directory exists but cannot be read: ${dirPath}`);
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedPath = (searchParams.get(&quot;path&quot;) || undefined) || "&quot;;

  const docsDir = findDocsDirectory();

  if (!docsDir) {
    return NextResponse.json(
      {
        error: &quot;Documentation directory not found&quot;,
      },
      { status: 404 },
    );
  }

  // Normalize and secure the path to prevent directory traversal attacks
  const normalizedPath = requestedPath.replace(/\.\./g, &quot;&quot;).replace(/^\/+/, &quot;&quot;);
  const fullPath = path.join(docsDir, normalizedPath);

  // Safety check - make sure the path is within the docs directory
  if (!fullPath.startsWith(docsDir)) {
    return NextResponse.json(
      {
        error: &quot;Invalid path requested&quot;,
      },
      { status: 400 },
    );
  }

  try {
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Return directory listing
      const items = fs
        .readdirSync(fullPath)
        .filter((item) => !item.startsWith(&quot;.&quot;)) // Filter out hidden files
        .map((item) => {
          const itemPath = path.join(fullPath, item);
          const isDir = fs.statSync(itemPath).isDirectory();

          return {
            name: item,
            type: isDir ? &quot;directory&quot; : &quot;file&quot;,
            path: path.join(normalizedPath, item).replace(/\\/g, &quot;/&quot;), // Ensure forward slashes
          };
        })
        .sort((a, b) => {
          // Sort directories first, then files
          if (a.type === &quot;directory&quot; && b.type === &quot;file&quot;) return -1;
          if (a.type === &quot;file&quot; && b.type === &quot;directory&quot;) return 1;
          return a.name.localeCompare(b.name);
        });

      return NextResponse.json({
        type: &quot;directory&quot;,
        path: normalizedPath,
        items,
      });
    } else {
      // Return file content
      let fileContent = fs.readFileSync(fullPath, &quot;utf-8&quot;);

      // For markdown files, convert to HTML
      if (fullPath.endsWith(&quot;.md&quot;) || fullPath.endsWith(&quot;.mdx&quot;)) {
        try {
          fileContent = marked.parse(fileContent);
        } catch (error) {
          // Fallback to raw content if parsing fails
          console.error(&quot;Error parsing markdown:&quot;, error);
        }
      }

      return NextResponse.json({
        type: &quot;file&quot;,
        path: normalizedPath,
        content: fileContent,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : &quot;Unknown error";
    return NextResponse.json(
      {
        error: `Error accessing documentation: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
