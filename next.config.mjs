import path from 'path';

// Environment detection - STANDARD APP BUILD (NO MOBILE CONTAMINATION)
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'
const isReplit = process.env.REPLIT || process.env.REPLIT_DOMAINS
const isVercel = process.env.VERCEL
// CRITICAL: Mobile builds must be explicitly isolated - never contaminate standard builds
const isMobileBuild = process.env.MOBILE_BUILD === 'true' && process.env.ISOLATE_MOBILE === 'true'
const isVoltBuilderBuild = process.env.VOLTBUILDER_BUILD === 'true' && process.env.ISOLATE_MOBILE === 'true'

console.log('[Next Config] Environment detection:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_ENV: appEnv,
  isReplit: !!isReplit,
  isVercel: !!isVercel, 
  isMobileBuild,
  isVoltBuilderBuild
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Standard app NEVER uses static export - always server mode
  // Mobile builds are completely isolated and use separate build process
  // This prevents VoltBuilder from contaminating standard app functionality
  distDir: '.next',
  trailingSlash: false,
  // Server mode for ALL standard deployments (Development, Autoscale, Vercel)
  
  // Basic configuration
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  
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
  
  webpack: (config, { isServer, dev }) => {
    // FAST staging builds - optimized for speed over memory
    if (!dev && process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
      // Speed-optimized configuration for faster deployments
      config.optimization = {
        ...config.optimization,
        minimize: true, // Enable minification for smaller bundles
        splitChunks: {
          chunks: 'all',
          maxSize: 1000000, // Larger chunks for faster builds (1MB)
          cacheGroups: {
            default: {
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
      
      // Fast build settings - prioritize speed
      config.parallelism = 4; // Multi-threaded for speed
      config.cache = {
        type: 'memory', // Fast memory cache
      };
    }
    
    // Resolve path issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd()),
    };
    
    return config;
  }
};

export default nextConfig;