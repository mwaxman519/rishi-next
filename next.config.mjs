/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration - no static export
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', '127.0.0.1', '.replit.dev', 'rishi-next.vercel.app', 'rishi-staging.replit.app']
    }
  },

  // Allow SVG favicon
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configure allowed dev origins for cross-origin requests
  experimental: {
    allowedOrigins: [
      'localhost',
      '127.0.0.1',
      '.replit.dev',
      '.spock.replit.dev',
      '3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev'
    ]
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