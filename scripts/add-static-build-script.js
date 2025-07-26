#!/usr/bin/env node

/**
 * Add static build script to package.json for Autoscale deployment
 */

import { readFileSync, writeFileSync } from 'fs';

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  
  // Add static build script if it doesn't exist
  if (!packageJson.scripts['build:static']) {
    packageJson.scripts['build:static'] = 'STATIC_EXPORT=1 next build';
    console.log('✅ Added build:static script to package.json');
  } else {
    console.log('✅ build:static script already exists');
  }
  
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated successfully');
  
} catch (error) {
  console.error('❌ Error updating package.json:', error);
  process.exit(1);
}