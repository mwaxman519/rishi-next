#!/usr/bin/env node

/**
 * Create Routes Manifest Script
 * Fixes the missing routes-manifest.json error for Vercel deployment
 */

import fs from 'fs';
import path from 'path';

function createRoutesManifest() {
  console.log('Creating routes manifest...');
  
  const manifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
  const manifestDir = path.dirname(manifestPath);
  
  // Create .next directory if it doesn't exist
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  
  // Create routes manifest for Next.js
  const manifest = {
    version: 3,
    pages404: true,
    basePath: "",
    redirects: [],
    rewrites: [],
    headers: [],
    dynamicRoutes: [
      {
        page: "/docs/[...slug]",
        regex: "^/docs/(.+?)(?:/)?$",
        namedRegex: "^/docs/(?<slug>.+?)(?:/)?$",
        routeKeys: {
          "slug": "slug"
        }
      }
    ],
    staticRoutes: [
      {
        page: "/",
        regex: "^/$",
        namedRegex: "^/$",
        routeKeys: {}
      }
    ]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Created routes manifest');
}

createRoutesManifest();