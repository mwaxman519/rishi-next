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
    // Autoscale deployment optimizations
    if (!dev && process.env.NEXT_PUBLIC_APP_ENV === 'staging') {
      // Reduce compilation time for autoscale
      config.optimization = {
        ...config.optimization,
        minimize: false, // Skip minification for faster builds
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // Smaller chunks
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              chunks: 'all',
              name: 'framework',
              priority: 40,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  }
};

export default nextConfig;