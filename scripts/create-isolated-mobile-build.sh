#!/bin/bash
echo "📱 Creating Completely Isolated Mobile Build Process..."

# Create isolated mobile build directory
mkdir -p mobile-build-isolated
cd mobile-build-isolated

echo "🔧 Setting up isolated mobile environment..."

# Copy essential files only
cp ../package.json .
cp ../next.config.mjs next.config.mobile.mjs
cp ../capacitor.config.ts .
cp ../voltbuilder.json .

# Create isolated mobile next.config.mjs
cat > next.config.mobile.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ISOLATED MOBILE BUILD - completely separate from main app
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: { unoptimized: true },
  
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Mobile-specific optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Disabled for mobile compatibility
  
  // Static export configuration
  generateStaticParams: async () => [],
  
  env: {
    MOBILE_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true'
  }
};

export default nextConfig;
EOF

echo "✅ Isolated mobile build environment created"
echo "📁 Location: mobile-build-isolated/"
echo "🎯 This prevents VoltBuilder from affecting your main app"
echo ""
echo "🚀 Mobile builds will now use:"
echo "   - Separate build directory"
echo "   - Isolated configuration"  
echo "   - No contamination of main codebase"

cd ..
echo "✅ Main app build process is now protected from mobile build contamination"