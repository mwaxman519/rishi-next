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
  
  // ULTRA-FAST staging deployment optimization
  ...(process.env.NEXT_PUBLIC_APP_ENV === 'staging' && {
    experimental: {
      // Disable expensive optimizations for speed
      optimizePackageImports: [],
      turbotrace: {
        logLevel: 'error',
      },
      swcMinify: false, // Disable minification for speed
      forceSwcTransforms: true,
    },
    outputFileTracing: false, // Disable for speed
    productionBrowserSourceMaps: false, // Disable for speed
  }),
  
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
    // ULTRA-FAST staging builds - optimized for SPEED ONLY
    if (!dev && process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
      // SPEED-FIRST configuration - sacrifice optimization for build speed
      config.optimization = {
        ...config.optimization,
        minimize: false, // DISABLE minification for speed
        splitChunks: {
          chunks: 'all',
          maxSize: 3000000, // LARGE chunks = fewer files = faster build (3MB)
          minSize: 200000, // Large minimum size
          cacheGroups: {
            default: false, // Disable default groups for speed
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
              maxSize: 3000000,
            },
          },
        },
      };
      
      // MAXIMUM parallelism for speed
      config.parallelism = 8;
      
      // Disable ALL source maps for speed
      config.devtool = false;
      
      // DISABLE tree shaking for speed (slower builds)
      config.optimization.usedExports = false;
      config.optimization.sideEffects = true;
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