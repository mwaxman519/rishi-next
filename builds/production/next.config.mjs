/** @type {import('next').NextConfig} */
const nextConfig = {
  // PRODUCTION MOBILE: Server mode for VoltBuilder (not static export)
  // output: 'export', // Disabled - causing generateStaticParams issues
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Static export optimizations
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  
  // Environment-specific configuration
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://rishi-platform.vercel.app',
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_BUILD_TYPE: 'mobile-static',
  },
  
  // Capacitor compatibility
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  
  // Disable server-side features for static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side build only
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;