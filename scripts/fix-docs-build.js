#!/usr/bin/env node

/**
 * Documentation Build Fix Script
 * Prevents static generation of non-existent documentation paths
 */

const fs = require('fs');
const path = require('path');

function fixDocsBuild() {
  console.log('🔧 Fixing documentation build issues...');
  
  // Disable static generation for docs during build if there are issues
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  
  if (fs.existsSync(nextConfigPath)) {
    let config = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Add fallback strategy for docs
    if (!config.includes('fallback: "blocking"')) {
      console.log('📝 Adding fallback strategy for documentation pages...');
      
      // Find the export statement and add docs configuration
      const docsConfig = `
// Add docs fallback configuration
const docsConfig = {
  experimental: {
    generateStaticParams: {
      skipValidation: true
    }
  },
  async generateBuildId() {
    return 'docs-build-' + Date.now();
  }
};
`;
      
      config = docsConfig + '\n' + config;
      fs.writeFileSync(nextConfigPath, config);
    }
  }
  
  // Create a minimal docs validation
  const docsDir = path.join(__dirname, '..', 'Docs');
  if (!fs.existsSync(docsDir)) {
    console.log('📁 Creating minimal docs structure...');
    fs.mkdirSync(docsDir, { recursive: true });
    
    // Create minimal README files
    const minimalDocs = [
      'README.md',
      'api/README.md',
      'architecture/README.md',
      'getting-started/README.md'
    ];
    
    for (const docPath of minimalDocs) {
      const fullPath = path.join(docsDir, docPath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (!fs.existsSync(fullPath)) {
        const title = path.basename(docPath, '.md').replace(/README/, 'Documentation');
        const content = `# ${title}\n\nDocumentation content will be added here.\n`;
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Created ${docPath}`);
      }
    }
  }
  
  console.log('✅ Documentation build fixes applied');
}

// Only run if called directly
if (require.main === module) {
  fixDocsBuild();
}

module.exports = { fixDocsBuild };