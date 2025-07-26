import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Required export const dynamic for static export compatibility
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Security check: only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Dev tools only available in development environment' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename parameter required' },
        { status: 400 }
      );
    }

    // Security: only allow specific file types and patterns
    if (!filename.match(/^(rishi.*\.zip|.*mobile.*\.zip|.*voltbuilder.*\.zip|capacitor\.config\.ts)$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), filename);
    
    try {
      const fileBuffer = readFileSync(filePath);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.zip')) {
        contentType = 'application/zip';
      } else if (filename.endsWith('.ts')) {
        contentType = 'text/typescript';
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'File not found or cannot be read' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}