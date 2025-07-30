#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Fix common ESLint errors across all files
const fixes = [
  // Fix unescaped quotes
  { pattern: /doesn't/g, replacement: "doesn&apos;t" },
  { pattern: /don't/g, replacement: "don&apos;t" },
  { pattern: /can't/g, replacement: "can&apos;t" },
  { pattern: /won't/g, replacement: "won&apos;t" },
  { pattern: /isn't/g, replacement: "isn&apos;t" },
  { pattern: /aren't/g, replacement: "aren&apos;t" },
  { pattern: /couldn't/g, replacement: "couldn&apos;t" },
  { pattern: /wouldn't/g, replacement: "wouldn&apos;t" },
  { pattern: /shouldn't/g, replacement: "shouldn&apos;t" },
  { pattern: /hasn't/g, replacement: "hasn&apos;t" },
  { pattern: /haven't/g, replacement: "haven&apos;t" },
  { pattern: /didn't/g, replacement: "didn&apos;t" },
  { pattern: /wasn't/g, replacement: "wasn&apos;t" },
  { pattern: /weren't/g, replacement: "weren&apos;t" },
  { pattern: /there's/g, replacement: "there&apos;s" },
  { pattern: /that's/g, replacement: "that&apos;s" },
  { pattern: /it's/g, replacement: "it&apos;s" },
  { pattern: /you're/g, replacement: "you&apos;re" },
  { pattern: /they're/g, replacement: "they&apos;re" },
  { pattern: /we're/g, replacement: "we&apos;re" },
  { pattern: /I'm/g, replacement: "I&apos;m" },
  { pattern: /let's/g, replacement: "let&apos;s" },
  { pattern: /what's/g, replacement: "what&apos;s" },
  { pattern: /who's/g, replacement: "who&apos;s" },
  { pattern: /where's/g, replacement: "where&apos;s" },
  { pattern: /when's/g, replacement: "when&apos;s" },
  { pattern: /how's/g, replacement: "how&apos;s" },
  { pattern: /here's/g, replacement: "here&apos;s" },
  // Fix quotes around words
  { pattern: /"([^"]+)"/g, replacement: "&quot;$1&quot;" },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const fix of fixes) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(fullPath, extensions);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      fixFile(fullPath);
    }
  }
}

console.log('Fixing ESLint errors in React components...');
walkDirectory('./app');
walkDirectory('./components');
console.log('ESLint fixes completed!');