import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined,
  compress: false,
  poweredByHeader: false,
  trailingSlash: false,
  
  // Fix Replit preview refresh issue
  reactStrictMode: true,
  
  // Development server configuration for Replit
  devIndicators: {
    position: 'bottom-right',
  },
  
  // Force static asset serving for images
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/rishi-logo-new.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
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
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
  },
  
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
    
    // CRITICAL: Disable complex chunking for Vercel production
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
      
      // Ensure login page gets its own chunk
      config.optimization.splitChunks.cacheGroups.login = {
        test: /[\\/]app[\\/]auth[\\/]login[\\/]/,
        name: 'login',
        chunks: 'all',
        priority: 20,
      };
    }
    
    return config;
  },
};

export default nextConfig;