/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard server mode for mobile builds (not static export)
  poweredByHeader: false,
  reactStrictMode: false,
  compress: true,
  
  // Disable ESLint and TypeScript checks for mobile builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Environment configuration
  env: {
    IS_MOBILE_BUILD: 'true',
    CAPACITOR_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true',
  },
  
  // Webpack configuration for mobile
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
