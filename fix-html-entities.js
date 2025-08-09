#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// HTML entity mappings to fix
const entityMappings = {
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&nbsp;': ' ',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&rdquo;': '"',
  '&ldquo;': '"',
  '&hellip;': '...',
  '&ndash;': '–',
  '&mdash;': '—'
};

function fixHtmlEntities(content) {
  let fixed = content;
  
  for (const [entity, replacement] of Object.entries(entityMappings)) {
    // Use global regex to replace all occurrences
    const regex = new RegExp(entity, 'g');
    fixed = fixed.replace(regex, replacement);
  }
  
  return fixed;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixHtmlEntities(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed HTML entities in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let filesProcessed = 0;
  let filesFixed = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git directories
        if (!['node_modules', '.next', '.git', 'build', 'dist'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          filesProcessed++;
          if (processFile(fullPath)) {
            filesFixed++;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return { filesProcessed, filesFixed };
}

// Target directories and files
const targets = [
  'components',
  'app',
  'shared',
  'lib',
  'contexts',
  'hooks'
];

console.log('🔧 Starting HTML entity cleanup...');

let totalProcessed = 0;
let totalFixed = 0;

for (const target of targets) {
  if (fs.existsSync(target)) {
    console.log(`\n📁 Processing ${target}/`);
    const { filesProcessed, filesFixed } = processDirectory(target);
    totalProcessed += filesProcessed;
    totalFixed += filesFixed;
    console.log(`   Processed: ${filesProcessed} files, Fixed: ${filesFixed} files`);
  }
}

console.log(`\n🎉 Cleanup complete!`);
console.log(`📊 Total files processed: ${totalProcessed}`);
console.log(`✨ Total files fixed: ${totalFixed}`);

if (totalFixed > 0) {
  console.log('\n🚀 HTML entities have been corrected. The build should now succeed.');
} else {
  console.log('\n✅ No HTML entity issues found.');
}