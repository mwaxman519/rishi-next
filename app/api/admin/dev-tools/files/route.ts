import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const files = [];
    
    // Check for ZIP files in root directory
    try {
      const rootFiles = readdirSync(process.cwd());
      for (const file of rootFiles) {
        if (file.endsWith('.zip') && file.includes('rishi')) {
          const filePath = join(process.cwd(), file);
          const stats = statSync(filePath);
          files.push({
            name: file,
            size: formatFileSize(stats.size),
            date: stats.mtime.toISOString().split('T')[0],
            type: 'zip' as const
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