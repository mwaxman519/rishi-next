#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Create .next directory if it doesn't exist
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
  console.log('Created .next directory');
}

// Create minimal routes-manifest.json
const routesManifest = {
  version: 3,
  pages404: false,
  basePath: "",
  redirects: [],
  rewrites: [],
  headers: [],
  dynamicRoutes: [],
  staticRoutes: [],
  dataRoutes: [],
  i18n: null
};

const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
console.log('Created routes-manifest.json');

// Create minimal prerender-manifest.json
const prerenderManifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: "development",
    previewModeSigningKey: "development",
    previewModeEncryptionKey: "development"
  }
};

const prerenderManifestPath = path.join(nextDir, 'prerender-manifest.json');
fs.writeFileSync(prerenderManifestPath, JSON.stringify(prerenderManifest, null, 2));
console.log('Created prerender-manifest.json');

// Create minimal build-manifest.json
const buildManifest = {
  polyfillFiles: [],
  devFiles: [],
  ampDevFiles: [],
  lowPriorityFiles: [],
  rootMainFiles: [],
  pages: {
    "/_app": [],
    "/_error": []
  },
  ampFirstPages: []
};

const buildManifestPath = path.join(nextDir, 'build-manifest.json');
fs.writeFileSync(buildManifestPath, JSON.stringify(buildManifest, null, 2));
console.log('Created build-manifest.json');

// Create server directory manifests
const serverDir = path.join(nextDir, 'server');
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
  console.log('Created server directory');
}

// Create next-font-manifest.json
const fontManifest = {
  pages: {},
  app: {},
  appUsingSizeAdjust: false,
  pagesUsingSizeAdjust: false
};

const fontManifestPath = path.join(serverDir, 'next-font-manifest.json');
fs.writeFileSync(fontManifestPath, JSON.stringify(fontManifest, null, 2));
console.log('Created next-font-manifest.json');

// Create middleware-manifest.json
const middlewareManifest = {
  version: 2,
  middleware: {},
  functions: {},
  sortedMiddleware: []
};

const middlewareManifestPath = path.join(serverDir, 'middleware-manifest.json');
fs.writeFileSync(middlewareManifestPath, JSON.stringify(middlewareManifest, null, 2));
console.log('Created middleware-manifest.json');

// Create app-paths-manifest.json
const appPathsManifest = {};

const appPathsManifestPath = path.join(serverDir, 'app-paths-manifest.json');
fs.writeFileSync(appPathsManifestPath, JSON.stringify(appPathsManifest, null, 2));
console.log('Created app-paths-manifest.json');

console.log('All development manifest files created successfully');