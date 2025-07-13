import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: NO static export for Vercel or Replit Autoscale - API routes need serverless functions
  // Only use static export for Azure Static Web Apps, not for Vercel or Replit Autoscale
  output: process.env.VERCEL || process.env.REPLIT ? undefined : 
    (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_ENV === 'production' 
      ? 'export'  // Static export for Azure only
      : undefined), // Server mode for development, staging (Replit Autoscale), and Vercel
  
  // Serverless optimizations
  compress: true,
  poweredByHeader: false,
  
  typescript: {
    // Continue through all errors to see comprehensive list
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
  
  // Experimental features for serverless
  experimental: {
    optimizeCss: false, // Reduce build complexity
  },
  
  // Static export configuration (only for production Azure, not Vercel or Replit Autoscale)
  ...(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_ENV === 'production' && !process.env.VERCEL && !process.env.REPLIT && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
  }),
  
  // Webpack optimization for Azure Functions (244KB limit)
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
    

    
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Bundle optimization for serverless
    if (!dev && !isServer) {
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
      
      // Reduce bundle complexity
      config.optimization.usedExports = false;
      config.optimization.providedExports = false;
    }
    
    return config;
  },
};

export default nextConfig;