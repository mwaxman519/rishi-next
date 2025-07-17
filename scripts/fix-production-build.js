#!/usr/bin/env node

/**
 * Fix Production Build Script
 * Ensures all files are properly configured for Vercel production deployment
 */

import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[Production Fix] ${message}`);
}

function fixProductionIssues() {
  log('Starting production build fixes...');

  // 1. Replace login page with production-safe version
  const loginPagePath = path.join(process.cwd(), 'app/auth/login/page.tsx');
  const productionLoginPath = path.join(process.cwd(), 'app/auth/login/page.production.tsx');
  
  if (fs.existsSync(productionLoginPath)) {
    fs.copyFileSync(productionLoginPath, loginPagePath);
    log('✓ Replaced login page with production-safe version');
  }

  // 2. Ensure CSS files are properly formatted
  const layoutCssPath = path.join(process.cwd(), 'app/globals.css');
  if (fs.existsSync(layoutCssPath)) {
    let css = fs.readFileSync(layoutCssPath, 'utf8');
    
    // Remove any potentially problematic CSS
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
    css = css.replace(/\s+/g, ' '); // Normalize whitespace
    css = css.trim();
    
    fs.writeFileSync(layoutCssPath, css);
    log('✓ Cleaned CSS files');
  }

  // 3. Create production-safe package.json scripts
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Ensure build script is production-safe
    packageJson.scripts.build = 'next build';
    packageJson.scripts.start = 'next start';
    
    // Safe postbuild script
    packageJson.scripts.postbuild = 'echo "Build completed successfully"';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✓ Updated package.json scripts');
  }

  log('Production build fixes completed!');
}

// Run the fixes
fixProductionIssues();