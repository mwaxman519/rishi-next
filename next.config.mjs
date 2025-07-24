import path from 'path';

// Environment detection - Industry Standard Multi-Environment Support
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'
const isReplit = process.env.REPLIT || process.env.REPLIT_DOMAINS
const isVercel = process.env.VERCEL
const isMobileBuild = process.env.MOBILE_BUILD === 'true'

console.log('[Next Config] Environment detection:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_ENV: appEnv,
  isReplit: !!isReplit,
  isVercel: !!isVercel, 
  isMobileBuild
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic output configuration based on build type
  ...(isMobileBuild ? {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
    images: { unoptimized: true }
  } : {
    output: undefined, // Server mode for web deployments
    distDir: '.next',
    trailingSlash: false
  }),
  
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
