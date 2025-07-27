import path from 'path';

// Environment detection - STANDARD APP BUILD (NO MOBILE CONTAMINATION)
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'
const isReplit = process.env.REPLIT || process.env.REPLIT_DOMAINS
const isVercel = process.env.VERCEL
// CRITICAL: Mobile builds must be explicitly isolated - never contaminate standard builds
const isMobileBuild = process.env.MOBILE_BUILD === 'true' && process.env.ISOLATE_MOBILE === 'true'
const isVoltBuilderBuild = process.env.VOLTBUILDER_BUILD === 'true' && process.env.ISOLATE_MOBILE === 'true'

// Set NODE_OPTIONS for memory optimization during staging deployment
if (appEnv === 'staging' && !process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--max-old-space-size=2048 --max-semi-space-size=128'
}

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
  
  // Memory-optimized staging deployment for heap size reduction
  ...(process.env.NEXT_PUBLIC_APP_ENV === 'staging' && {
    experimental: {
      // Disable memory-intensive optimizations
      optimizePackageImports: [],
      turbotrace: {
        logLevel: 'error',
        logDetail: false,
        processCwd: process.cwd(),
        // Reduce memory usage by limiting trace complexity
        contextDirectory: process.cwd(),
        memoryLimit: 512, // Limit memory usage (MB)
      },
      swcMinify: false, // Disable minification to reduce heap usage
      forceSwcTransforms: false, // Reduce transform complexity
      // Disable memory-intensive features for staging
      optimizeCss: false,
      optimizeServerReact: false,
    },
    outputFileTracing: false, // Disable file tracing to reduce memory
    productionBrowserSourceMaps: false, // Disable source maps to save memory
    // Reduce build parallelism to conserve memory
    parallelism: 1,
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
    // Memory-optimized staging builds - reduced heap usage
    if (!dev && process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
      // MEMORY-FIRST configuration - minimize heap usage during build
      config.optimization = {
        ...config.optimization,
        minimize: false, // Disable minification to reduce memory usage
        splitChunks: {
          chunks: 'all',
          // Smaller chunks to reduce memory pressure
          maxSize: 1000000, // 1MB chunks instead of 3MB
          minSize: 100000, // Smaller minimum size
          maxAsyncRequests: 6, // Reduce concurrent loading
          maxInitialRequests: 4, // Reduce initial bundle complexity
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 1000000,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
              maxSize: 1000000,
              reuseExistingChunk: true,
            },
          },
        },
        // Reduce memory usage during optimization
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
      
      // Reduced parallelism to conserve memory
      config.parallelism = 2;
      
      // Disable source maps to save memory
      config.devtool = false;
      
      // Simplified tree shaking to reduce memory usage
      config.optimization.usedExports = false;
      config.optimization.sideEffects = true;
      
      // Memory-conscious cache configuration
      config.cache = {
        type: 'memory',
        maxGenerations: 1, // Reduce cache generations
      };
      
      // Reduce resolve complexity
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
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