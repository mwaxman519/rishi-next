/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: FULL SERVER MODE - Required for Neon database, event bus, and API routes
  reactStrictMode: false, // Disabled for mobile compatibility
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint for VoltBuilder builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checking for VoltBuilder
  },
  
  // Mobile-specific optimizations while preserving ALL server functionality
  images: {
    unoptimized: false, // Keep image optimization for mobile
  },
  
  // Environment configuration for mobile
  env: {
    IS_MOBILE_BUILD: 'true',
    CAPACITOR_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true',
    NEXT_PUBLIC_APP_ENV: 'staging',
  },
  
  // External packages for serverless
  serverExternalPackages: ['@neondatabase/serverless', 'bcryptjs'],
  
  // Mobile-specific headers for Capacitor
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow Capacitor WebView
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'capacitor://localhost', // Allow Capacitor
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' capacitor://localhost https://rishi-staging.replit.app; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for mobile optimization
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      // Optimize for mobile while preserving server functionality
      config.optimization.minimize = true;
    }
    return config;
  },
};

export default nextConfig;