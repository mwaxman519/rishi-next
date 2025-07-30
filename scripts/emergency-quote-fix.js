#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Emergency fix for corrupted HTML entities in code files
const fixCorruptedQuotes = (content) => {
  // Fix HTML entities back to proper quotes
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&apos;/g, "'");
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&amp;/g, '&');
  
  return content;
};

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixCorruptedQuotes(content);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Emergency fix: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  const filesToFix = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      filesToFix.push(...walkDirectory(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      filesToFix.push(fullPath);
    }
  }
  return filesToFix;
}

// Fix all files with HTML entities
const criticalFiles = [
  ...walkDirectory('./app'),
  ...walkDirectory('./components'),
  ...walkDirectory('./lib'),
  ...walkDirectory('./hooks'),
  ...walkDirectory('./contexts')
];

console.log('🚨 EMERGENCY: Fixing corrupted HTML entities in critical files...');

for (const file of criticalFiles) {
  fixFile(file);
}

console.log('✅ Emergency quote fixes completed!');