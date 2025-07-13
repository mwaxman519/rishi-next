const fs = require('fs');
const path = require('path');

console.log('🔧 VERCEL IMPORT PATH FIXING SCRIPT');

function fixImportPaths(dir, levelUp) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixImportPaths(fullPath, levelUp + 1);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Calculate the correct relative path
      const relativePath = '../'.repeat(levelUp);
      
      // Fix lib imports
      const libPattern = /from\s+["']\.\.\/\.\.\/(\.\.\/)*lib\//g;
      const newLibPath = `from "${relativePath}lib/`;
      if (content.match(libPattern)) {
        content = content.replace(libPattern, newLibPath);
        changed = true;
      }
      
      // Fix shared imports
      const sharedPattern = /from\s+["']\.\.\/\.\.\/(\.\.\/)*shared\//g;
      const newSharedPath = `from "${relativePath}shared/`;
      if (content.match(sharedPattern)) {
        content = content.replace(sharedPattern, newSharedPath);
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath} (${levelUp} levels up)`);
      }
    }
  }
}

// Start fixing from app/api directory
fixImportPaths('app/api', 3); // Base level is 3 levels up
