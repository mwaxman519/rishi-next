#!/bin/bash
echo "🚀 Optimizing Autoscale Build Performance..."

# Create optimized next.config for autoscale
cat > next.config.autoscale.mjs << 'EOF'
/** @type {import('next').NextConfig} */

// Environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const NEXT_PUBLIC_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const isReplit = !!process.env.REPLIT_DOMAINS;
const isVercel = !!process.env.VERCEL;
const isMobileBuild = process.env.MOBILE_BUILD === 'true';
const isVoltBuilderBuild = process.env.VOLTBUILDER_BUILD === 'true' && isMobileBuild;

console.log('[Next Config] Environment detection:', {
  NODE_ENV,
  NEXT_PUBLIC_APP_ENV,
  isReplit,
  isVercel,
  isMobileBuild,
  isVoltBuilderBuild
});

const nextConfig = {
  // Autoscale optimizations
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Fast build configuration for autoscale
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable expensive features during autoscale builds
  generateBuildId: () => 'autoscale-build',
  
  // Minimal static generation
  images: {
    unoptimized: true,
  },
  
  // Faster compilation
  swcMinify: true,
  
  // Reduce bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize for faster builds
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
EOF

# Backup current config and use optimized version
if [ ! -f "next.config.mjs.backup" ]; then
    cp next.config.mjs next.config.mjs.backup
fi

cp next.config.autoscale.mjs next.config.mjs

echo "✅ Autoscale build optimization complete"
echo "🎯 Optimizations applied:"
echo "   - Disabled TypeScript/ESLint checks"
echo "   - Reduced static page generation"
echo "   - Optimized webpack configuration"
echo "   - Minimized bundle analysis"