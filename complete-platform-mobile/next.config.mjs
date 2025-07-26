/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://rishi-staging.replit.app',
    NEXT_PUBLIC_APP_ENV: 'staging',
    MOBILE_BUILD: 'true'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://rishi-staging.replit.app/api/:path*'
      }
    ];
  }
};

export default nextConfig;
