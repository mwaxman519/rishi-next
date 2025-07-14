#!/usr/bin/env node

/**
 * Build Optimization Script
 * Comprehensive optimizations for Vercel deployment builds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function optimizeBuild() {
  console.log('🚀 Applying build optimizations...');
  
  // 1. Documentation build optimization
  console.log('📚 Optimizing documentation build process...');
  
  // Check if docs directory exists and has content
  const docsDir = path.join(__dirname, '..', 'Docs');
  let docsExists = false;
  let docsCount = 0;
  
  if (fs.existsSync(docsDir)) {
    try {
      const getAllFiles = (dir) => {
        let files = [];
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(getAllFiles(fullPath));
          } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
            files.push(fullPath);
          }
        }
        return files;
      };
      
      const markdownFiles = getAllFiles(docsDir);
      docsCount = markdownFiles.length;
      docsExists = docsCount > 0;
      
      console.log(`📖 Found ${docsCount} documentation files`);
    } catch (error) {
      console.warn('⚠️  Error checking docs directory:', error.message);
    }
  }
  
  // 2. Environment variable optimization
  console.log('🔧 Setting build environment variables...');
  
  // Set optimization flags for production builds
  process.env.SKIP_DOCS_STATIC_GENERATION = docsExists ? 'false' : 'true';
  process.env.BUILD_OPTIMIZATION = 'true';
  process.env.DOCS_COUNT = docsCount.toString();
  
  console.log(`📊 Build optimization summary:`);
  console.log(`   - Documentation files: ${docsCount}`);
  console.log(`   - Static generation: ${docsExists ? 'enabled' : 'disabled'}`);
  console.log(`   - Build optimization: enabled`);
  
  // 3. Create build info file
  const buildInfo = {
    timestamp: new Date().toISOString(),
    docsCount,
    docsEnabled: docsExists,
    optimization: 'enabled'
  };
  
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  
  console.log('✅ Build optimization completed');
  return buildInfo;
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeBuild();
}

export { optimizeBuild };