#!/usr/bin/env node

/**
 * Create Middleware Manifest Script
 * Fixes the missing middleware-manifest.json error
 */

import fs from 'fs';
import path from 'path';

function createMiddlewareManifest() {
  console.log('Creating middleware manifest...');
  
  const manifestPath = path.join(process.cwd(), '.next', 'server', 'middleware-manifest.json');
  const manifestDir = path.dirname(manifestPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  
  // Create minimal middleware manifest
  const manifest = {
    sortedMiddleware: [],
    middleware: {},
    functions: {},
    version: 2
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Created middleware manifest');
}

createMiddlewareManifest();