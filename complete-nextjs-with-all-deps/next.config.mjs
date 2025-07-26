/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  
  // Environment detection
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
    NEXT_PUBLIC_APP_ENV: 'staging',
    NEXT_PUBLIC_API_URL: 'https://rishi-staging.replit.app',
    MOBILE_BUILD: 'true',
    VOLTBUILDER_BUILD: 'false'
  },

  // Replit-specific configuration for mobile
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  typescript: {
    ignoreBuildErrors: true
  },

  // Image optimization for mobile
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },

  // Webpack optimization for mobile
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil'
    });
    return config;
  }
};

export default nextConfig;
