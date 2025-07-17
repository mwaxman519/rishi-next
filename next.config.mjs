import path from 'path';

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
    
    // Vercel-specific optimizations - simplified to prevent chunking issues
    if (!isServer && !dev) {
      // Minimal chunking configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;