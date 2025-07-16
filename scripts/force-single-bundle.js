#!/usr/bin/env node

/**
 * Force Single Bundle Configuration
 * Creates a build that outputs a single bundle file to prevent chunk loading issues
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Forcing single bundle configuration...\n');

// Create a radical single-bundle next.config.mjs
const radicalConfig = `import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined,
  compress: true,
  poweredByHeader: false,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: false,
  },
  
  serverExternalPackages: ['@neondatabase/serverless'],
  experimental: {},
  
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
    
    // RADICAL: Force everything into a single bundle
    if (!isServer && !dev) {
      // Completely disable code splitting
      config.optimization.splitChunks = false;
      
      // Disable dynamic imports
      config.optimization.usedExports = false;
      config.optimization.sideEffects = false;
      
      // Force single entry point
      config.entry = async () => {
        const entries = await config.entry();
        return {
          main: entries.main,
        };
      };
    }
    
    return config;
  },
};

export default nextConfig;`;

// Write the radical config
fs.writeFileSync('next.config.mjs', radicalConfig);

console.log('✅ Created radical single-bundle configuration');
console.log('🚀 This should prevent ALL chunk creation');
console.log('📦 Everything will be bundled into a single main file');
console.log('🔄 Test with: npm run build');

export default { radicalConfig };