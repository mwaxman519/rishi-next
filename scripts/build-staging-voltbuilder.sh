#!/bin/bash

# Regular Staging VoltBuilder Build Script
# Creates proper staging mobile app without contaminating main codebase

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="staging-voltbuilder-build"
CAPACITOR_CONFIG="capacitor.config.staging.ts"

echo "🚀 Building Rishi Platform Staging VoltBuilder Package"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Check if staging config exists
if [ ! -f "$CAPACITOR_CONFIG" ]; then
  echo "❌ Error: $CAPACITOR_CONFIG not found"
  exit 1
fi

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Creating isolated staging build..."

# Copy entire project to build directory
echo "📁 Copying project files..."
cp -r . "$BUILD_DIR/"
cd "$BUILD_DIR"
rm -rf .next node_modules builds android ios out 2>/dev/null || true

# Set staging environment
echo "⚙️ Configuring for staging environment..."
cp .env.staging .env.production

# Copy staging Capacitor config
cp "$CAPACITOR_CONFIG" capacitor.config.ts

# Update next.config.mjs for mobile build
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    esmExternals: false
  }
};

export default nextConfig;
EOF

echo "🔨 Installing dependencies and building..."
npm install

# Build the application
MOBILE_BUILD=true NODE_ENV=production NEXT_PUBLIC_APP_ENV=staging npm run build

echo "📱 Setting up Capacitor..."
# Ensure Capacitor is installed
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios

# Initialize Capacitor if needed
if [ ! -f "capacitor.config.ts" ]; then
  npx cap init "Rishi Platform Staging" "com.rishi.platform.staging" --web-dir=out
fi

# Add Android platform
npx cap add android || true
npx cap sync android

# Create VoltBuilder package
cd ..
PACKAGE_NAME="rishi-staging-voltbuilder-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating VoltBuilder package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*" "*/builds/*" "*/.next/*"

# Get package size
PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ STAGING VOLTBUILDER PACKAGE CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 App ID: com.rishi.platform.staging"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload $PACKAGE_NAME to VoltBuilder"
echo "   2. Configure project settings"
echo "   3. Compile native binaries"
echo "   4. Test on device"