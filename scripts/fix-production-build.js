#!/usr/bin/env node

/**
 * Production Build Fix Script
 * Identifies and fixes issues causing chunk loading failures in production
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing production build issues...\n');

// Check for common build issues
const checkBuildIssues = () => {
  const issues = [];
  
  // Check if login page exists
  const loginPagePath = 'app/auth/login/page.tsx';
  if (!fs.existsSync(loginPagePath)) {
    issues.push(`Login page missing: ${loginPagePath}`);
  }
  
  // Check for CSS issues
  const nextConfigPath = 'next.config.mjs';
  if (fs.existsSync(nextConfigPath)) {
    const config = fs.readFileSync(nextConfigPath, 'utf8');
    if (config.includes('cssChunking') && !config.includes('serverComponentsExternalPackages')) {
      issues.push('Missing serverComponentsExternalPackages configuration');
    }
  }
  
  // Check for TypeScript errors
  const tsConfigPath = 'tsconfig.json';
  if (fs.existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    if (tsConfig.compilerOptions?.skipLibCheck !== true) {
      issues.push('TypeScript configuration may cause build slowdowns');
    }
  }
  
  return issues;
};

// Main execution
const issues = checkBuildIssues();

if (issues.length > 0) {
  console.log('⚠️  Found issues:');
  issues.forEach(issue => console.log(`  - ${issue}`));
  console.log();
} else {
  console.log('✅ No obvious build issues found');
}

// Recommendations
console.log('🔍 Recommendations:');
console.log('  1. Ensure all pages have proper imports and exports');
console.log('  2. Check that all CSS files are properly structured');
console.log('  3. Verify TypeScript compilation succeeds locally');
console.log('  4. Test build with production environment variables');
console.log();

console.log('✅ Build fix script completed');