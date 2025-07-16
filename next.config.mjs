import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server mode for API routes (required for authentication system)
  output: undefined,
  
  // Disable experimental features that cause chunk issues
  experimental: {},
  
  // Optimize images for Vercel
  images: {
    unoptimized: false,
  },
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Serverless configuration
  serverExternalPackages: ['@neondatabase/serverless'],
  
  // Webpack configuration to prevent chunk loading issues
  webpack: (config, { isServer, dev }) => {
    // Path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'app'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
      '@/shared': path.resolve(process.cwd(), 'shared'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@/services': path.resolve(process.cwd(), 'app/services'),
      '@db': path.resolve(process.cwd(), 'db'),
    };
    
    // Fallback configuration for serverless
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Aggressive chunk consolidation for Vercel
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 0,
        maxSize: 500000, // Larger chunks to prevent loading issues
        cacheGroups: {
          default: false,
          vendors: false,
          // Single main bundle to prevent chunk loading errors
          main: {
            name: 'main',
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;