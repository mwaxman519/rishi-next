/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor compatibility
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Disable features incompatible with static export
  images: {
    unoptimized: true,
  },
  
  // Environment configuration
  env: {
    IS_MOBILE_BUILD: 'true',
    CAPACITOR_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true',
  },
  
  // Optimize for mobile
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
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
