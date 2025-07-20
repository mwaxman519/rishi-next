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
    // Optimize for Replit Autoscale deployment
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
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
    
    // Environment-specific optimizations
    if (process.env.REPLIT || process.env.REPLIT_DOMAINS) {
      // Replit Autoscale specific optimizations
      config.optimization.minimize = true;
      if (config.optimization.splitChunks && config.optimization.splitChunks.cacheGroups && config.optimization.splitChunks.cacheGroups.vendor) {
        config.optimization.splitChunks.cacheGroups.vendor.name = 'vendors';
      }
    }
    
    return config;
  },
};

export default nextConfig;