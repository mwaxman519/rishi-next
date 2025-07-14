#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Build script that ensures documentation files are available in production
 */

console.log('🔧 Building Rishi Platform with documentation support...');

// Step 1: Copy documentation files to public directory
console.log('📁 Copying documentation files to public directory...');
try {
  execSync('node scripts/copy-docs-to-public.js', { stdio: 'inherit' });
  console.log('✅ Documentation files copied successfully');
} catch (error) {
  console.error('❌ Failed to copy documentation files:', error.message);
  process.exit(1);
}

// Step 2: Run the normal Next.js build
console.log('🚀 Building Next.js application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify documentation files are accessible
console.log('🔍 Verifying documentation files are accessible...');
const publicDocsPath = path.join(process.cwd(), 'public', 'Docs');
if (fs.existsSync(publicDocsPath)) {
  const stats = fs.statSync(publicDocsPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(publicDocsPath);
    console.log(`✅ Documentation directory accessible with ${files.length} items`);
  } else {
    console.log('❌ public/Docs exists but is not a directory');
    process.exit(1);
  }
} else {
  console.log('❌ public/Docs directory not found after copy');
  process.exit(1);
}

console.log('🎉 Build completed successfully with documentation support!');