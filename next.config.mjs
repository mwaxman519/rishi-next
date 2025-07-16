import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic server mode configuration
  output: undefined,
  
  // Essential optimizations
  compress: true,
  poweredByHeader: false,
  
  // Build configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    unoptimized: false,
  },
  
  // Serverless packages
  serverExternalPackages: ['@neondatabase/serverless'],
  
  // Minimal experimental features
  experimental: {},
  
  // Essential webpack configuration only
  webpack: (config) => {
    // Path aliases only
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'app'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
      '@/shared': path.resolve(process.cwd(), 'shared'),
      '@shared': path.resolve(process.cwd(), 'shared'),
    };
    
    // Serverless fallbacks
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },
};

export default nextConfig;