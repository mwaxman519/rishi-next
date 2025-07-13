const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE SYNTAX ERROR FIXING');

function fixSyntaxErrors(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixSyntaxErrors(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Fix malformed URL searchParams access: url.( -> url.searchParams.
      if (content.includes('url.(')) {
        content = content.replace(/url\.\(/g, 'url.searchParams.');
        changed = true;
      }
      
      // Fix double undefined patterns: || undefined || 
      if (content.includes('|| undefined ||')) {
        content = content.replace(/\|\| undefined \|\|/g, '||');
        changed = true;
      }
      
      // Fix orphaned searchParams calls after the url.( fix
      if (content.includes('url.searchParams.searchParams.')) {
        content = content.replace(/url\.searchParams\.searchParams\./g, 'url.searchParams.');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixSyntaxErrors('app/api');
