#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix corrupted import statements 
const fixImportQuotes = (content) => {
  // Fix imports
  content = content.replace(/import\s+{([^}]+)}\s+from\s+&quot;([^&]+)&quot;;/g, 'import {$1} from "$2";');
  content = content.replace(/import\s+([^\s]+)\s+from\s+&quot;([^&]+)&quot;;/g, 'import $1 from "$2";');
  content = content.replace(/from\s+&quot;([^&]+)&quot;;/g, 'from "$1";');
  
  // Fix common strings but preserve JSX content
  content = content.replace(/&quot;([^&\s]+)&quot;/g, '"$1"');
  content = content.replace(/&apos;/g, "'");
  
  return content;
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = fixImportQuotes(content);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed imports: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

console.log('Fixing corrupted imports and quotes...');
fixFile('./components/SidebarLayout.tsx');
fixFile('./app/components/PublicLayout.tsx');
console.log('Import fixes completed!');