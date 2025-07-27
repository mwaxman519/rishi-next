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
  
  // Staging deployment size optimization
  ...(process.env.NEXT_PUBLIC_APP_ENV === 'staging' && {
    experimental: {
      optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@hookform/resolvers'],
      turbotrace: {
        logLevel: 'error',
      },
    },
    outputFileTracing: false, // Disable for smaller builds
    swcMinify: true,
    // Disable source maps for staging
    productionBrowserSourceMaps: false,
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
    // ULTRA-FAST staging builds - optimized for deployment speed and size
    if (!dev && process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
      // Speed and size optimized configuration for faster deployments
      config.optimization = {
        ...config.optimization,
        minimize: true, // Enable minification for smaller bundles
        splitChunks: {
          chunks: 'all',
          maxSize: 500000, // Medium chunks for faster deployment (500KB)
          minSize: 20000, // Minimum chunk size
          cacheGroups: {
            default: {
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              maxSize: 500000,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
              maxSize: 500000,
            },
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 30,
              maxSize: 500000,
            },
          },
        },
      };
      
      // Ultra-fast build settings
      config.parallelism = 6; // Maximum threads for speed
      config.cache = {
        type: 'memory', // Fast memory cache
        maxMemoryGenerations: 1, // Limit cache memory
      };
      
      // Aggressive deployment size optimization for staging
      if (isServer) {
        config.devtool = false; // Remove source maps for smaller bundles
      }
      
      // Tree shaking optimization
      config.usedExports = true;
      config.sideEffects = false;
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