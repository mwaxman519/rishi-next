import { NextRequest, NextResponse } from "next/server";
import { readdirSync, statSync, existsSync } from "fs";
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
    
    // Check for ZIP files in organized build directories
    try {
      const buildDirs = [
        { path: 'builds/Replit Dev', env: 'development' },
        { path: 'builds/Replit Autoscale Staging', env: 'staging' },
        { path: 'builds/Vercel Production', env: 'production' }
      ];
      
      const buildFiles: Record<string, any> = {}; // Track latest builds by environment
      
      for (const buildDir of buildDirs) {
        try {
          const buildDirPath = join(process.cwd(), buildDir.path);
          if (existsSync(buildDirPath)) {
            const dirFiles = readdirSync(buildDirPath);
            for (const file of dirFiles) {
              if (file.endsWith('.zip') && file.includes('rishi')) {
                const filePath = join(buildDirPath, file);
                const stats = statSync(filePath);
                
                // Determine file category and environment  
                let fileType: 'zip' | 'mobile' | 'voltbuilder' = 'mobile';
                const environment = buildDir.env;
                
                if (file.includes('voltbuilder')) {
                  fileType = 'voltbuilder';
                }
                
                const fileData = {
                  name: file,
                  size: formatFileSize(stats.size),
                  path: buildDir.path,
                  date: stats.mtime.toISOString().split('T')[0],
                  mtime: stats.mtime.getTime(),
                  type: fileType as any,
                  description: getFileDescription(file),
                  environment
                };
                
                // Keep only the latest file for each environment
                const key = `${fileType}-${environment}`;
                if (!buildFiles[key] || buildFiles[key].mtime < fileData.mtime) {
                  buildFiles[key] = fileData;
                }
              }
            }
          }
        } catch (error) {
          console.log(`Error reading build directory ${buildDir.path}:`, error);
        }
      }
      
      // Add the latest files to the result
      Object.values(buildFiles).forEach((fileData: any) => {
        const { mtime, environment, ...file } = fileData;
        files.push(file);
      });
      
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