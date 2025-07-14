import fs from 'fs';
import path from 'path';

/**
 * Copy Docs directory to public folder for Vercel production access
 * This ensures documentation files are accessible in production builds
 */

const sourceDir = path.join(process.cwd(), 'Docs');
const targetDir = path.join(process.cwd(), 'public', 'Docs');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Copy all files in directory
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Copy file
    fs.copyFileSync(src, dest);
  }
}

// Only run if Docs directory exists
if (fs.existsSync(sourceDir)) {
  console.log('Copying Docs directory to public folder for production access...');
  copyRecursive(sourceDir, targetDir);
  console.log('✅ Docs directory copied to public/Docs');
} else {
  console.log('⚠️  Docs directory not found, skipping copy');
}