import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as marked from "marked";

// Find Docs directory in various potential locations
function findDocsDirectory(): string | null {
  const baseDir = process.cwd();
  const possiblePaths = [
    path.join(baseDir, "Docs"),
    path.join(baseDir, "docs"),
    path.join(baseDir, "public", "Docs"),
    path.join(baseDir, "public", "docs"),
    path.join(baseDir, ".next", "standalone", "Docs"),
    path.join(baseDir, ".next", "server", "Docs"),
    "/home/runner/Docs",
    "/home/runner/workspace/Docs",
    "/Docs",
  ];

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      try {
        // Make sure we can read from the directory
        fs.readdirSync(dirPath);
        return dirPath;
      } catch (e) {
        // Directory exists but we can't read from it
        console.error(`Directory exists but cannot be read: ${dirPath}`);
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestedPath = ((searchParams.get("path") || undefined) || undefined) || "";

  const docsDir = findDocsDirectory();

  if (!docsDir) {
    return NextResponse.json(
      {
        error: "Documentation directory not found",
      },
      { status: 404 },
    );
  }

  // Normalize and secure the path to prevent directory traversal attacks
  const normalizedPath = requestedPath.replace(/\.\./g, "").replace(/^\/+/, "");
  const fullPath = path.join(docsDir, normalizedPath);

  // Safety check - make sure the path is within the docs directory
  if (!fullPath.startsWith(docsDir)) {
    return NextResponse.json(
      {
        error: "Invalid path requested",
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
        .filter((item) => !item.startsWith(".")) // Filter out hidden files
        .map((item) => {
          const itemPath = path.join(fullPath, item);
          const isDir = fs.statSync(itemPath).isDirectory();

          return {
            name: item,
            type: isDir ? "directory" : "file",
            path: path.join(normalizedPath, item).replace(/\\/g, "/"), // Ensure forward slashes
          };
        })
        .sort((a, b) => {
          // Sort directories first, then files
          if (a.type === "directory" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "directory") return 1;
          return a.name.localeCompare(b.name);
        });

      return NextResponse.json({
        type: "directory",
        path: normalizedPath,
        items,
      });
    } else {
      // Return file content
      let fileContent = fs.readFileSync(fullPath, "utf-8");

      // For markdown files, convert to HTML
      if (fullPath.endsWith(".md") || fullPath.endsWith(".mdx")) {
        try {
          fileContent = marked.parse(fileContent);
        } catch (error) {
          // Fallback to raw content if parsing fails
          console.error("Error parsing markdown:", error);
        }
      }

      return NextResponse.json({
        type: "file",
        path: normalizedPath,
        content: fileContent,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: `Error accessing documentation: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
