
import path from 'path';
import fs from 'fs';

/**
 * Server-only function for getting docs directory
 * This should only be used in server-side code (API routes, etc.)
 */
export function getDocsDirectory(): string {
  try {
    const docsPath = path.join(process.cwd(), 'public', 'Docs');
    
    // Check if directory exists, create minimal structure if not
    if (!fs.existsSync(docsPath)) {
      try {
        fs.mkdirSync(docsPath, { recursive: true });
        // Create a minimal README.md file
        fs.writeFileSync(
          path.join(docsPath, 'README.md'), 
          '# Documentation\n\nWelcome to the documentation system.\n'
        );
      } catch (error) {
        console.error('Failed to create docs directory:', error);
      }
    }
    
    return docsPath;
  } catch (error) {
    console.error('Error accessing docs directory:', error);
    // Return fallback path
    return path.join(process.cwd(), 'public', 'Docs');
  }
}

/**
 * Check if a file exists (server-side only)
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Read file contents (server-side only)
 */
export function readFileSync(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}
