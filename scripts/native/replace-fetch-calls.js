#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Find all TypeScript and JavaScript files that contain fetch('/api
const files = execSync('find app/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "fetch(\'/api" 2>/dev/null || echo ""', { encoding: 'utf8' }).trim().split('\n').filter(f => f);

console.log('🔍 Found files with fetch(\'/api calls:', files.length);

let totalReplacements = 0;

files.forEach(file => {
  if (!file || !fs.existsSync(file)) return;
  
  console.log('📝 Processing:', file);
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Check if apiFetch is already imported
  const hasApiFetchImport = content.includes('apiFetch') && (content.includes('from "@/lib/api"') || content.includes("from '@/lib/api'"));
  
  // Add import if not present and there are fetch calls to replace
  if (!hasApiFetchImport && content.includes('fetch(\'/api')) {
    // Find the last import statement
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1] || '');
    
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport) + '\nimport { apiFetch } from "@/lib/api";' + content.slice(endOfLastImport);
      modified = true;
      console.log('  ✅ Added apiFetch import');
    }
  }
  
  // Replace all fetch('/api calls with apiFetch('/api
  const originalContent = content;
  content = content.replace(/fetch\(\'\/api/g, "apiFetch('/api");
  content = content.replace(/fetch\("\/api/g, 'apiFetch("/api');
  
  // Count replacements
  const matches = originalContent.match(/fetch\(['"]\/api/g);
  const replacements = matches ? matches.length : 0;
  
  if (replacements > 0) {
    console.log(`  🔄 Replaced ${replacements} fetch('/api calls`);
    totalReplacements += replacements;
    modified = true;
  }
  
  // Write file if modified
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`  💾 Saved ${file}`);
  }
});

console.log(`\n✅ Completed: ${totalReplacements} total replacements in ${files.length} files`);

if (totalReplacements === 0) {
  console.log('🎉 No fetch(\'/api calls found - all clean!');
}