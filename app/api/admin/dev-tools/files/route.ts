import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Security check: only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Dev tools only available in development environment' },
        { status: 403 }
      );
    }
    const files = [];
    
    // Check for ZIP files in root directory (mobile builds and VoltBuilder packages)
    try {
      const rootFiles = readdirSync(process.cwd());
      for (const file of rootFiles) {
        if (file.endsWith('.zip') && (file.includes('rishi') || file.includes('mobile'))) {
          const filePath = join(process.cwd(), file);
          const stats = statSync(filePath);
          
          // Determine file category based on name patterns
          let fileType: 'zip' | 'mobile' | 'voltbuilder' = 'zip';
          if (file.includes('mobile') || file.includes('voltbuilder')) {
            fileType = file.includes('voltbuilder') ? 'voltbuilder' : 'mobile';
          }
          
          files.push({
            name: file,
            size: formatFileSize(stats.size),
            date: stats.mtime.toISOString().split('T')[0],
            type: fileType as any,
            description: getFileDescription(file)
          });
        }
      }
    } catch (error) {
      console.log("Error reading root directory:", error);
    }
    
    // Check for capacitor config
    try {
      const configPath = join(process.cwd(), 'capacitor.config.ts');
      const stats = statSync(configPath);
      files.push({
        name: 'capacitor.config.ts',
        size: formatFileSize(stats.size),
        date: stats.mtime.toISOString().split('T')[0],
        type: 'config' as const
      });
    } catch (error) {
      console.log("Capacitor config not found");
    }
    
    // Sort by date, newest first
    files.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    
    return NextResponse.json({ files });
    
  } catch (error) {
    console.error("[Dev Tools Files] Error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileDescription(filename: string): string {
  if (filename.includes('development')) return 'Development mobile build';
  if (filename.includes('staging')) return 'Staging mobile build';
  if (filename.includes('production')) return 'Production mobile build';
  if (filename.includes('voltbuilder')) return 'VoltBuilder compilation package';
  if (filename.includes('mobile')) return 'Mobile app package';
  return 'Build package';
}