const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE IMPORT PATH FIXING');

function fixAllImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixAllImports(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Fix all relative lib imports to absolute
      const libRegex = /from ["']\.\.\/[\.\/]*lib\/([^"']+)["']/g;
      const newContent = content.replace(libRegex, 'from "@/lib/$1"');
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
      
      // Fix all relative shared imports to absolute
      const sharedRegex = /from ["']\.\.\/[\.\/]*shared\/([^"']+)["']/g;
      const newContent2 = content.replace(sharedRegex, 'from "@shared/$1"');
      if (newContent2 !== content) {
        content = newContent2;
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixAllImports('app/api');
