/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },
  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: [
    '3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev',
    'localhost:5000',
    '127.0.0.1:5000',
    '0.0.0.0:5000'
  ],
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_NAME: 'Rishi Platform'
  }
};

export default nextConfig;