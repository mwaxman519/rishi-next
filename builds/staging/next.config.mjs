/** @type {import('next').NextConfig} */
const nextConfig = {
  // HYBRID APPROACH: Static export with remote API backend
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Disable features incompatible with static export
  reactStrictMode: false,
  poweredByHeader: false,
  compress: false,
  
  // Build optimizations for VoltBuilder
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization (disabled for static export)
  images: {
    unoptimized: true,
  },
  
  // Environment configuration for mobile hybrid approach
  env: {
    IS_MOBILE_BUILD: 'true',
    CAPACITOR_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true',
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_API_BASE_URL: 'https://rishi-platform.vercel.app',
  },
  
  // Webpack configuration for VoltBuilder compatibility
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Disable problematic chunking for VoltBuilder
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
      config.optimization.runtimeChunk = false;
      
      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        util: false,
        stream: false,
      };
    }
    return config;
  },
  
  // Remove problematic experimental features
  experimental: {
    // Keep minimal for VoltBuilder compatibility
  },
};

export default nextConfig;