import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js server mode for Vercel deployment
  output: undefined, // Use default server mode, not static export
  trailingSlash: false, // Disable for Vercel compatibility
  distDir: '.next', // Use standard .next directory for Vercel
  
  // Basic configuration
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true, // Enable compression for production
  generateEtags: true, // Generate ETags for caching
  
  // Development server configuration for Replit
  devIndicators: {
    position: 'bottom-right',
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Clean configuration for Next.js 15.4.2
  
  serverExternalPackages: ['@neondatabase/serverless'],
  
  webpack: (config, { isServer, dev }) => {
    // Simple path aliases only
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'app'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
      '@/shared': path.resolve(process.cwd(), 'shared'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@db': path.resolve(process.cwd(), 'db.ts'),
    };
    
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
