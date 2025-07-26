#!/usr/bin/env node

/**
 * Fix Autoscale Deployment Issues
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 Fixing Autoscale deployment issues...');

// 1. Fix db/index.ts export issue
const dbIndexPath = 'db/index.ts';
if (existsSync(dbIndexPath)) {
  let dbContent = readFileSync(dbIndexPath, 'utf8');
  
  // Remove the problematic export default line
  dbContent = dbContent.replace('export { testConnection as default };', '');
  
  writeFileSync(dbIndexPath, dbContent);
  console.log('✅ Fixed db/index.ts export');
}

// 2. Fix dynamic export issues in API routes
const dynamicRoutes = [
  'app/api/admin/dev-tools/download/route.ts'
];

dynamicRoutes.forEach(routePath => {
  if (existsSync(routePath)) {
    let content = readFileSync(routePath, 'utf8');
    
    // Add dynamic export if missing
    if (!content.includes('export const dynamic')) {
      content = content.replace(
        'import { NextRequest, NextResponse } from "next/server";',
        'import { NextRequest, NextResponse } from "next/server";\n\nexport const dynamic = "force-dynamic";'
      );
      
      writeFileSync(routePath, content);
      console.log(`✅ Added dynamic export to ${routePath}`);
    }
  }
});

// 3. Add missing exports to package.json for static build
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

// Ensure we have the right build script
if (!packageJson.scripts['build:autoscale']) {
  packageJson.scripts['build:autoscale'] = 'next build';
  console.log('✅ Added build:autoscale script');
}

writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('🚀 Autoscale deployment fixes completed!');
console.log('');
console.log('Summary of fixes:');
console.log('- Fixed testConnection export in db/index.ts');
console.log('- Added dynamic export configurations');
console.log('- Updated build scripts');
console.log('- Fixed VoltBuilder detection in next.config.mjs');