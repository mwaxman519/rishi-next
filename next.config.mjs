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
    forceSwcTransforms: true,
  },
  
  webpack: (config, { isServer, dev }) => {
    // Clean webpack configuration for Replit Autoscale
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
    
    // Remove any existing CSS rules that might reference style-loader
    if (config.module && config.module.rules) {
      config.module.rules = config.module.rules.filter(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          return !rule.use.some(loader => 
            typeof loader === 'string' && loader.includes('style-loader') ||
            typeof loader === 'object' && loader.loader && loader.loader.includes('style-loader')
          );
        }
        return true;
      });
    }
    
    // Simplified chunking for development stability
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;