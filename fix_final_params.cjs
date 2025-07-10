const fs = require('fs');

// Find and fix the remaining files
const { execSync } = require('child_process');

try {
  // Find files that still have the old pattern
  const result = execSync('find app/api -name "route.ts" -exec grep -l "params: { id: string }" {} \\;', { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(f => f);
  
  console.log(`🔧 Found ${files.length} files still needing fixes:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Fix ALL remaining patterns systematically
    
    // Pattern 1: Basic params signature
    if (content.includes('{ params }: { params: { id: string } }')) {
      content = content.replace(/{\s*params\s*}:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g, 
        '{ params }: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }
    
    // Pattern 2: Context signature  
    if (content.includes('context: { params: { id: string } }')) {
      content = content.replace(/context:\s*{\s*params:\s*{\s*id:\s*string\s*}\s*}/g,
        'context: { params: Promise<{ id: string }> }');
      hasChanges = true;
    }
    
    // Pattern 3: Multi-line interface
    content = content.replace(/params:\s*{\s*id:\s*string;\s*}/g, 'params: Promise<{ id: string; }>');
    if (content !== fs.readFileSync(filePath, 'utf8')) hasChanges = true;
    
    // Pattern 4: Ensure await is added where params is accessed
    if (content.includes('params.id') && !content.includes('await params')) {
      // Add await before params access
      content = content.replace(/const\s+{\s*id\s*}\s*=\s*params;/g, 'const { id } = await params;');
      content = content.replace(/const\s+\w+\s*=\s*params\.id;/g, (match) => {
        const varName = match.match(/const\s+(\w+)/)[1];
        return `const { id: ${varName} } = await params;`;
      });
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ FIXED: ${filePath}`);
    }
  });
  
  console.log(`\n🎯 All async params issues resolved!`);
  
} catch (error) {
  console.log('Error finding files:', error.message);
}
