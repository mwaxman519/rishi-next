/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration - no static export
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', '127.0.0.1', '.replit.dev', 'rishi-next.vercel.app', 'rishi-staging.replit.app']
    }
  },
  
  // Remove X-Frame-Options completely to allow iframe embedding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  }
};

export default nextConfig;