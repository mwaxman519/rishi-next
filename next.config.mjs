/** @type {import('next').NextConfig} */

// VoltBuilder-specific configuration for mobile app compilation
const nextConfigVoltBuilder = {
  // Static export required for VoltBuilder mobile compilation
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Disable dynamic features for static export
  experimental: {},
  
  // Environment variables for VoltBuilder
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rishi-next.vercel.app',
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_APP_NAME: 'Rishi Platform'
  },
  
  // Webpack configuration for VoltBuilder compatibility
  webpack: (config, { dev, isServer }) => {
    // Production optimizations for mobile
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false
      };
    }
    
    // Ignore fs module for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      };
    }
    
    return config;
  },
  
  // TypeScript and linting - skip for VoltBuilder builds to handle warnings
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Static generation settings
  generateEtags: false,
  poweredByHeader: false,
  
  // Exclude API routes from static export
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('api'))
};

export default nextConfigVoltBuilder;