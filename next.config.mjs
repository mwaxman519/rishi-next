/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration - no static export
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', '127.0.0.1', '.replit.dev', 'rishi-next.vercel.app', 'rishi-staging.replit.app']
    }
  },
  
  // Allow Replit preview
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.replit.dev *.replit.com;",
          },
        ],
      },
    ];
  },

  // Configure allowed dev origins for cross-origin requests
  allowedDevOrigins: [
    '.replit.dev',
    'localhost',
    '127.0.0.1'
  ]
};

export default nextConfig;