/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  // Fix cross-origin warning for Replit dev environment
  allowedDevOrigins: [
    '3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev',
    '.replit.dev'
  ]
};

export default nextConfig;