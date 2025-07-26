import path from 'path';

// Environment detection - AUTOSCALE DEPLOYMENT OPTIMIZED
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'
const isReplit = process.env.REPLIT || process.env.REPLIT_DOMAINS
const isVercel = process.env.VERCEL
const isMobileBuild = process.env.MOBILE_BUILD === 'true'
// CRITICAL: Only VoltBuilder when explicitly set AND mobile build - no auto-detection
const isVoltBuilderBuild = process.env.VOLTBUILDER_BUILD === 'true' && isMobileBuild

console.log('[Next Config] Environment detection:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_ENV: appEnv,
  isReplit: !!isReplit,
  isVercel: !!isVercel, 
  isMobileBuild,
  isVoltBuilderBuild
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL FOR AUTOSCALE: Never use static export for server deployments
  // Only use static export for explicit mobile builds
  ...((isMobileBuild || isVoltBuilderBuild) ? {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
    images: { unoptimized: true }
  } : {
    // Server mode for ALL non-mobile deployments (Autoscale + Vercel)
    distDir: '.next',
    trailingSlash: false
    // No output: 'export' for server deployments
  }),
  
  // Basic configuration
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  
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
  
  webpack: (config, { isServer, dev }) => {
    return config;
  }
};

export default nextConfig;