#!/usr/bin/env node

/**
 * Static Build Validation Script
 * Prevents database connection errors during static export by mocking required modules
 */

import fs from "fs";
import path from "path";

console.log("🔍 Validating static build configuration...");

// 1. Create mock database module for static builds
const mockDbPath = "app/lib/db-mock.ts";
const mockDbContent = `
// Mock database for static builds
export const db = {
  select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ where: () => [] })
};

export const pool = {
  connect: () => ({ query: () => ({ rows: [] }), release: () => {} })
};

export const checkDatabaseConnection = () => Promise.resolve(true);
`;

fs.writeFileSync(mockDbPath, mockDbContent);
console.log("✅ Created mock database module");

// 2. Create static-safe environment configuration
const staticEnvPath = ".env.static";
const staticEnvContent = `
# Static build environment - no database connections
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
BUILD_TARGET=static

# Disable database operations
ENABLE_MOCK_DATA=true
SKIP_DATABASE_OPERATIONS=true

# Mock secrets for build process
DATABASE_URL=mock://localhost/static_build
SESSION_SECRET=static-build-secret
JWT_SECRET=static-build-jwt-secret
`;

fs.writeFileSync(staticEnvPath, staticEnvContent);
console.log("✅ Created static build environment");

// 3. Create build-safe API route wrapper
const apiWrapperPath = "scripts/wrap-api-routes.mjs";
const apiWrapperContent = `
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all API routes
const apiRoutes = glob.sync('app/api/**/route.ts');

apiRoutes.forEach(routePath => {
  let content = fs.readFileSync(routePath, 'utf8');
  
  // Wrap database operations in try-catch for static builds
  if (content.includes('export async function') && !content.includes('BUILD_TARGET_WRAPPED')) {
    content = \`// BUILD_TARGET_WRAPPED
if (process.env.BUILD_TARGET === 'static') {
  export async function GET() { return new Response(JSON.stringify({}), { status: 200 }); }
  export async function POST() { return new Response(JSON.stringify({}), { status: 200 }); }
  export async function PUT() { return new Response(JSON.stringify({}), { status: 200 }); }
  export async function DELETE() { return new Response(JSON.stringify({}), { status: 200 }); }
} else {
\${content}
}
\`;
    
    fs.writeFileSync(routePath, content);
    console.log(\`Wrapped API route: \${routePath}\`);
  }
});
`;

fs.writeFileSync(apiWrapperPath, apiWrapperContent);
console.log("✅ Created API route wrapper");

// 4. Update static Next.js config to use mocks
const staticConfigPath = "next.config.static.mjs";
if (fs.existsSync(staticConfigPath)) {
  let configContent = fs.readFileSync(staticConfigPath, "utf8");

  // Add webpack alias for database mocking
  const webpackAlias = `
  webpack: (config, { isServer }) => {
    config.cache = false;
    
    // Alias database imports to mock for static builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/db': path.resolve('./app/lib/db-mock.ts'),
      '@/db': path.resolve('./app/lib/db-mock.ts')
    };
    
    return config;
  },`;

  if (!configContent.includes("resolve.alias")) {
    configContent = configContent.replace(
      "webpack: (config, { isServer }) => {",
      webpackAlias,
    );

    fs.writeFileSync(staticConfigPath, configContent);
    console.log("✅ Updated static config with database mocking");
  }
}

console.log("🎯 Static build validation completed");
