#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates that all documentation paths are valid before deployment
 */

const fs = require('fs');
const path = require('path');

// Get the documentation directory
const docsDir = path.join(__dirname, '..', 'Docs');

function validateDocs() {
  console.log('📚 Validating documentation structure...');
  
  if (!fs.existsSync(docsDir)) {
    console.error('❌ Documentation directory not found:', docsDir);
    process.exit(1);
  }

  // Get all markdown files
  const getAllMarkdownFiles = (dir, basePath = '') => {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...getAllMarkdownFiles(fullPath, relativePath));
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        files.push(relativePath);
      }
    }
    
    return files;
  };

  const markdownFiles = getAllMarkdownFiles(docsDir);
  
  console.log(`✅ Found ${markdownFiles.length} documentation files`);
  
  // Check for common issues
  const issues = [];
  
  for (const file of markdownFiles) {
    const fullPath = path.join(docsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for empty files
    if (content.trim().length === 0) {
      issues.push(`Empty file: ${file}`);
    }
    
    // Check for files without titles
    if (!content.includes('# ') && !content.includes('title:')) {
      issues.push(`No title found in: ${file}`);
    }
  }
  
  if (issues.length > 0) {
    console.warn('⚠️  Documentation issues found:');
    for (const issue of issues) {
      console.warn(`  - ${issue}`);
    }
  }
  
  console.log('✅ Documentation validation complete');
  return markdownFiles;
}

// Only run validation if called directly
if (require.main === module) {
  validateDocs();
}

module.exports = { validateDocs };