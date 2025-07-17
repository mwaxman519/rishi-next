#!/usr/bin/env node

/**
 * Comprehensive Vercel Production Fix Script
 * Addresses MIME type issues, chunking problems, and static asset serving
 */

import fs from 'fs';
import path from 'path';

function log(message) {
  console.log(`[Vercel Production Fix] ${message}`);
}

function fixVercelProduction() {
  log('Starting comprehensive Vercel production fixes...');

  // 1. Create ultra-minimal Next.js config that prevents chunking
  const nextConfigContent = `import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: false,
  poweredByHeader: false,
  trailingSlash: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  serverExternalPackages: ['@neondatabase/serverless'],
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
    webpackBuildWorker: false,
  },
  
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'app'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
      '@/shared': path.resolve(process.cwd(), 'shared'),
      '@shared': path.resolve(process.cwd(), 'shared'),
    };
    
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // CRITICAL: Completely disable all chunking for production
    if (!isServer && !dev) {
      config.optimization.splitChunks = false;
      config.optimization.runtimeChunk = false;
      config.optimization.minimize = false;
      config.optimization.mangleExports = false;
      config.optimization.concatenateModules = false;
    }
    
    return config;
  },
};

export default nextConfig;`;

  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  fs.writeFileSync(nextConfigPath, nextConfigContent);
  log('✓ Created minimal Next.js config with no chunking');

  // 2. Create production-specific CSS that won't cause MIME issues
  const globalsCssPath = path.join(process.cwd(), 'app', 'globals.css');
  if (fs.existsSync(globalsCssPath)) {
    let css = fs.readFileSync(globalsCssPath, 'utf8');
    
    // Clean and minimize CSS
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
    css = css.replace(/\s+/g, ' '); // Normalize whitespace
    css = css.replace(/;(\s*;)+/g, ';'); // Remove duplicate semicolons
    css = css.replace(/\s*{\s*/g, '{'); // Remove space around braces
    css = css.replace(/\s*}\s*/g, '}');
    css = css.replace(/\s*:\s*/g, ':'); // Remove space around colons
    css = css.replace(/\s*;\s*/g, ';'); // Remove space around semicolons
    css = css.trim();
    
    // Ensure proper CSS structure
    if (!css.startsWith('@tailwind')) {
      css = '@tailwind base;@tailwind components;@tailwind utilities;' + css;
    }
    
    fs.writeFileSync(globalsCssPath, css);
    log('✓ Optimized globals.css for production');
  }

  // 3. Create minimal vercel.json that fixes MIME types
  const vercelConfigContent = `{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/_next/static/chunks/(.*).js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      "source": "/_next/static/css/(.*).css",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}`;

  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  fs.writeFileSync(vercelConfigPath, vercelConfigContent);
  log('✓ Created production vercel.json with MIME type fixes');

  // 4. Ensure login page is production-ready
  const loginPagePath = path.join(process.cwd(), 'app', 'auth', 'login', 'page.tsx');
  const productionLoginPath = path.join(process.cwd(), 'app', 'auth', 'login', 'page.production.tsx');
  
  if (fs.existsSync(productionLoginPath)) {
    fs.copyFileSync(productionLoginPath, loginPagePath);
    log('✓ Ensured production login page is active');
  }

  log('Comprehensive Vercel production fixes completed!');
}

// Run the fixes
fixVercelProduction();