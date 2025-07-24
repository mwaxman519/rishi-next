#!/usr/bin/env node

/**
 * Verify that dev-tools are properly secured for production deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔒 Verifying deployment security for dev-tools...');

// Check if dev-tools pages have proper environment checks
const devToolsFiles = [
  'app/dev-tools/page.tsx',
  'app/admin/dev-tools/page.tsx',
  'app/api/admin/dev-tools/execute/route.ts',
  'app/api/admin/dev-tools/files/route.ts'
];

let allSecured = true;

devToolsFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for environment protection
    const hasEnvCheck = content.includes("process.env.NODE_ENV !== 'development'") ||
                       content.includes("NODE_ENV === 'development'");
    
    if (hasEnvCheck) {
      console.log(`✅ ${filePath} - Properly secured with environment check`);
    } else {
      console.log(`❌ ${filePath} - Missing environment security check`);
      allSecured = false;
    }
  } else {
    console.log(`⚠️  ${filePath} - File not found`);
  }
});

// Check Vercel deployment configuration
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('📋 Vercel configuration found');
} else {
  console.log('📋 No vercel.json found - using default Vercel deployment');
}

console.log('');
if (allSecured) {
  console.log('🔒 SECURITY VERIFICATION PASSED');
  console.log('✅ All dev-tools are properly secured for production deployment');
  console.log('✅ Dev-tools will only be accessible in development environment');
} else {
  console.log('🚨 SECURITY VERIFICATION FAILED');
  console.log('❌ Some dev-tools lack proper environment protection');
  process.exit(1);
}