import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security: Only allow downloading from mobile-build directory
    const allowedPaths = [
      'mobile-build',
      'out'
    ];
    
    let filePath: string | null = null;
    
    // Check each allowed directory for the file
    for (const allowedPath of allowedPaths) {
      const testPath = join(process.cwd(), allowedPath, filename);
      if (existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }
    
    if (!filePath || !existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    const stats = statSync(filePath);
    
    // Don't allow downloading directories
    if (stats.isDirectory()) {
      return NextResponse.json(
        { error: "Cannot download directories" },
        { status: 400 }
      );
    }
    
    const fileBuffer = readFileSync(filePath);
    
    // Determine content type based on file extension
    const contentType = getContentType(filename);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stats.size.toString(),
      },
    });
    
  } catch (error) {
    console.error("[Dev Tools Download] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'zip':
      return 'application/zip';
    case 'apk':
      return 'application/vnd.android.package-archive';
    case 'ipa':
      return 'application/octet-stream';
    case 'json':
      return 'application/json';
    case 'js':
      return 'application/javascript';
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    default:
      return 'application/octet-stream';
  }
}