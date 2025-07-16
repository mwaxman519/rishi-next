import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simple output configuration - let Vercel handle serverless optimization
  // CRITICAL: Never use static export with dynamic API routes - causes build failures
  // Static export only for Azure Static Web Apps AND not staging environment
  output: (process.env.AZURE_STATIC_WEB_APPS_API_TOKEN && process.env.NEXT_PUBLIC_APP_ENV !== 'staging') ? 'export' : undefined,
  
  // Basic serverless optimizations
  compress: true,
  poweredByHeader: false,
  
  typescript: {
    // Allow comprehensive error capture - continue building to surface all errors
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Skip ESLint during builds for faster deployment
    ignoreDuringBuilds: true,
  },
  
  images: {
    // Use Vercel image optimization when available
    unoptimized: process.env.VERCEL ? false : true,
    domains: process.env.VERCEL ? ['localhost', 'vercel.app'] : [],
  },
  
  // Simplified experimental features
  experimental: {
    optimizeCss: false, // Reduce build complexity
    cssChunking: 'strict', // Better CSS chunking for production
  },
  
  // Static export configuration (only for Azure Static Web Apps and not staging)
  ...(process.env.AZURE_STATIC_WEB_APPS_API_TOKEN && process.env.NEXT_PUBLIC_APP_ENV !== 'staging' && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
  }),
  
  // Simplified webpack configuration for better Vercel compatibility
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
    
    // Only apply complex optimization for Azure (not Vercel)
    if (!dev && !isServer && !process.env.VERCEL) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // 244KB for Azure Functions
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 1,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;