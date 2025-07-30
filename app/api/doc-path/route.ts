import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import fs from &quot;fs&quot;;
import path from &quot;path&quot;;

const DOCS_DIRECTORIES = [
  path.join(process.cwd(), &quot;Docs&quot;),
  path.join(process.cwd(), &quot;public/Docs&quot;),
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const docPath = (searchParams.get(&quot;path&quot;) || undefined) || undefined;

  if (!docPath) {
    return NextResponse.json({ error: &quot;No path provided&quot; }, { status: 400 });
  }

  // Clean up path to prevent path traversal attacks
  const cleanPath = docPath.replace(/\.\./g, "&quot;).replace(/^\/+/, &quot;&quot;);

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
            type: &quot;directory&quot;,
            exists: true,
            files: files,
            baseDir,
          });
        } else {
          // For files, return content
          const content = fs.readFileSync(fullPath, &quot;utf-8&quot;);
          return NextResponse.json({
            path: cleanPath,
            type: &quot;file&quot;,
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

  // If we get here, the file wasn&apos;t found in any directory
  return NextResponse.json({
    path: cleanPath,
    exists: false,
    error: &quot;File not found in any docs directory",
    checkedDirs: DOCS_DIRECTORIES,
  });
}
