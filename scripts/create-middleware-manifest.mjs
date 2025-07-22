#!/usr/bin/env node

/**
 * Create Middleware and Routes Manifest Script
 * Fixes the missing manifest files for Vercel deployment
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

function createRoutesManifest() {
  console.log('Creating routes manifest...');
  
  const manifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
  const manifestDir = path.dirname(manifestPath);
  
  // Create .next directory if it doesn't exist
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  
  // Create routes manifest for Next.js/Vercel
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
      },
      {
        page: "/users/[id]",
        regex: "^/users/([^/]+?)(?:/)?$",
        namedRegex: "^/users/(?<id>[^/]+?)(?:/)?$",
        routeKeys: {
          "id": "id"
        }
      },
      {
        page: "/locations/[id]",
        regex: "^/locations/([^/]+?)(?:/)?$", 
        namedRegex: "^/locations/(?<id>[^/]+?)(?:/)?$",
        routeKeys: {
          "id": "id"
        }
      }
    ],
    staticRoutes: [
      {
        page: "/",
        regex: "^/$",
        namedRegex: "^/$", 
        routeKeys: {}
      },
      {
        page: "/dashboard",
        regex: "^/dashboard(?:/)?$",
        namedRegex: "^/dashboard(?:/)?$",
        routeKeys: {}
      }
    ]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ Created routes manifest');
}

// Create both manifests
createMiddlewareManifest();
createRoutesManifest();