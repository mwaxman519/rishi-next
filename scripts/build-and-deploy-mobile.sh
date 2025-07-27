#!/bin/bash

# Automated Mobile Build and Deploy Script for Rishi Platform
# Builds the mobile package and automatically deploys via VoltBuilder API

set -e

echo "🚀 Rishi Platform Mobile Build & Deploy Automation"
echo "=================================================="

# Configuration
ENVIRONMENT=${1:-staging}
PLATFORMS=${2:-android,ios}
BUILD_TYPE=${3:-release}

echo "📋 Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Platforms: $PLATFORMS"
echo "   Build Type: $BUILD_TYPE"
echo ""

# Step 1: Prepare build directory
echo "🔧 Preparing mobile build..."
BUILD_DIR="builds/$ENVIRONMENT"

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found: $BUILD_DIR"
    echo "Please run the mobile build setup first."
    exit 1
fi

cd "$BUILD_DIR"

# Step 2: Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build || {
    echo "❌ Next.js build failed"
    exit 1
}

echo "✅ Next.js build completed"

# Step 3: Create VoltBuilder package
echo "📦 Creating VoltBuilder package..."
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
PACKAGE_NAME="rishi-${ENVIRONMENT}-auto-${TIMESTAMP}.zip"

zip -r "$PACKAGE_NAME" \
  android/ \
  ios/ \
  app/ \
  components/ \
  lib/ \
  shared/ \
  styles/ \
  public/ \
  services/ \
  hooks/ \
  contexts/ \
  .next/ \
  capacitor.config.ts \
  capacitor.config.json \
  package.json \
  next.config.mjs \
  .env.production \
  tsconfig.json \
  tailwind.config.js \
  drizzle.config.ts \
  -x "node_modules/*" \
  -x "*.log" \
  -x ".git/*" \
  >/dev/null 2>&1

if [ ! -f "$PACKAGE_NAME" ]; then
    echo "❌ Failed to create package"
    exit 1
fi

PACKAGE_SIZE=$(ls -lh "$PACKAGE_NAME" | awk '{print $5}')
echo "✅ Package created: $PACKAGE_NAME ($PACKAGE_SIZE)"

# Step 4: Upload and build via VoltBuilder API
echo "🚀 Starting VoltBuilder automated deployment..."
cd ../..

node scripts/voltbuilder-api.js "builds/$ENVIRONMENT/$PACKAGE_NAME" "$PLATFORMS"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 MOBILE BUILD AUTOMATION COMPLETED!"
    echo "===================================="
    echo ""
    echo "📦 Package: builds/$ENVIRONMENT/$PACKAGE_NAME"
    echo "📱 Platforms: $PLATFORMS"
    echo "🏗️ VoltBuilder: Build completed successfully"
    echo ""
    echo "✅ Your native mobile apps are ready for download!"
    echo "   Check VoltBuilder dashboard: https://voltbuilder.com/"
else
    echo "❌ VoltBuilder automation failed"
    exit 1
fi