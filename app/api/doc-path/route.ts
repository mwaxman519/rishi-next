import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOCS_DIRECTORIES = [
  path.join(process.cwd(), "Docs"),
  path.join(process.cwd(), "public/Docs"),
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const docPath = (searchParams.get("path") || undefined) || undefined;

  if (!docPath) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  // Clean up path to prevent path traversal attacks
  const cleanPath = docPath.replace(/\.\./g, "").replace(/^\/+/, "");

  // Try each possible docs directory
  for (const baseDir of DOCS_DIRECTORIES) {
    try {
      const fullPath = path.join(baseDir, cleanPath);

      // Check if file exists
      if (fs.existsSync(fullPath)) {
        // Return file content based on file type
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          // For directories, list contents
          const files = fs.readdirSync(fullPath);
          return NextResponse.json({
            path: cleanPath,
            type: "directory",
            exists: true,
            files: files,
            baseDir,
          });
        } else {
          // For files, return content
          const content = fs.readFileSync(fullPath, "utf-8");
          return NextResponse.json({
            path: cleanPath,
            type: "file",
            exists: true,
            content,
            baseDir,
          });
        }
      }
    } catch (err) {
      // Just log and continue to try the next directory
      console.error(`Error checking ${cleanPath} in ${baseDir}:`, err);
    }
  }

  // If we get here, the file wasn't found in any directory
  return NextResponse.json({
    path: cleanPath,
    exists: false,
    error: "File not found in any docs directory",
    checkedDirs: DOCS_DIRECTORIES,
  });
}
