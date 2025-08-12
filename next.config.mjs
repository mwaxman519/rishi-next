/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
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
  // Ensure trailing slashes for static export
  trailingSlash: true,
  // Skip API routes in static export
  skipMiddlewareUrlNormalize: true,
  // Environment variables for static build
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rishi-next.vercel.app',
    NEXT_PUBLIC_APP_ENV: 'production',
    NEXT_PUBLIC_APP_NAME: 'Rishi Platform'
  }
};

export default nextConfig;