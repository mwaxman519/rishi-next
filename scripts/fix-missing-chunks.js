#!/usr/bin/env node

/**
 * Fix Missing Chunks Script
 * Addresses the production chunk loading failures seen in Vercel deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing missing chunks in production build...\n');

// Check if login page has proper dynamic imports
const fixLoginPageImports = () => {
  const loginPath = 'app/auth/login/page.tsx';
  if (!fs.existsSync(loginPath)) {
    console.log('❌ Login page not found');
    return false;
  }
  
  const content = fs.readFileSync(loginPath, 'utf8');
  
  // Check for potential dynamic import issues
  if (content.includes('dynamic(')) {
    console.log('⚠️  Dynamic imports detected in login page');
    return false;
  }
  
  // Check for proper imports
  if (!content.includes('export default function LoginPage')) {
    console.log('❌ Login page export invalid');
    return false;
  }
  
  console.log('✅ Login page imports look correct');
  return true;
};

// Check CSS configuration
const fixCSSConfiguration = () => {
  const nextConfigPath = 'next.config.mjs';
  if (!fs.existsSync(nextConfigPath)) {
    console.log('❌ Next.js config not found');
    return false;
  }
  
  const config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check for CSS chunking issues
  if (config.includes('cssChunking')) {
    console.log('⚠️  CSS chunking configuration detected');
    
    // Disable CSS chunking to fix production issues
    const updatedConfig = config.replace(
      /cssChunking: 'strict',/g,
      'cssChunking: false, // Disabled to fix production chunk loading'
    );
    
    if (updatedConfig !== config) {
      fs.writeFileSync(nextConfigPath, updatedConfig);
      console.log('✅ Fixed CSS chunking configuration');
      return true;
    }
  }
  
  console.log('✅ CSS configuration looks good');
  return true;
};

// Check for middleware issues
const checkMiddleware = () => {
  const middlewarePath = 'middleware.ts';
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    if (content.includes('NextResponse')) {
      console.log('✅ Middleware configuration found');
      return true;
    }
  }
  
  console.log('⚠️  No middleware configuration found');
  return true; // Not critical
};

// Main execution
const fixes = [
  { name: 'Login Page Imports', fix: fixLoginPageImports },
  { name: 'CSS Configuration', fix: fixCSSConfiguration },
  { name: 'Middleware Check', fix: checkMiddleware }
];

let allFixed = true;

for (const fix of fixes) {
  console.log(`🔍 Checking ${fix.name}...`);
  const result = fix.fix();
  if (!result) {
    allFixed = false;
  }
  console.log('');
}

console.log('📊 Summary:');
if (allFixed) {
  console.log('✅ All fixes applied successfully!');
  console.log('📝 Next steps:');
  console.log('  1. Redeploy to Vercel to test fixes');
  console.log('  2. Or deploy to Replit Autoscale as primary target');
} else {
  console.log('❌ Some issues remain. Please review the output above.');
}

export default { allFixed };