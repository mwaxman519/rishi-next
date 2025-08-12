#!/bin/bash

# Rishi Platform Production Mobile Build Script
# Creates a VoltBuilder-ready package for production deployment

set -e

echo "🚀 Rishi Platform Production Mobile Build"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo "   • API Endpoint: https://rishi-next.vercel.app"
echo "   • Environment: Production"
echo "   • Target: Mobile (VoltBuilder)"
echo ""

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf out .next release/rishi-capacitor.zip

# Create release directory
mkdir -p release

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_API_BASE_URL=https://rishi-next.vercel.app
export NEXT_PUBLIC_APP_ENV=production
export NEXT_PUBLIC_APP_NAME="Rishi Platform"

# Temporarily move API routes to avoid static export errors
echo -e "${YELLOW}📦 Preparing for static export...${NC}"
if [ -d "app/api" ]; then
    mv app/api app/api.backup
    echo "   • Temporarily moved API routes"
fi

# Build the static Next.js app
echo -e "${YELLOW}🔨 Building static export...${NC}"
if [ -f "next.config.voltbuilder.mjs" ]; then
    # Use voltbuilder config
    cp next.config.mjs next.config.mjs.original
    cp next.config.voltbuilder.mjs next.config.mjs
    
    # Run the build
    npx next build
    
    # Restore original config
    mv next.config.mjs.original next.config.mjs
else
    echo -e "${RED}❌ next.config.voltbuilder.mjs not found${NC}"
    # Restore API routes if moved
    if [ -d "app/api.backup" ]; then
        mv app/api.backup app/api
    fi
    exit 1
fi

# Restore API routes
if [ -d "app/api.backup" ]; then
    mv app/api.backup app/api
    echo -e "${GREEN}   ✓ Restored API routes${NC}"
fi

# Check if build was successful
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Build failed: 'out' directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Static build completed successfully${NC}"

# Copy to Capacitor web assets
echo -e "${YELLOW}📋 Syncing with Capacitor...${NC}"
npx cap copy
npx cap sync

# Create VoltBuilder package
echo -e "${YELLOW}📦 Creating VoltBuilder package...${NC}"
zip -r release/rishi-capacitor.zip \
  android \
  ios \
  out \
  capacitor.config.ts \
  voltbuilder.json \
  package.json \
  package-lock.json \
  node_modules/@capacitor \
  node_modules/@capacitor-community \
  -x "*.git*" \
  -x "*node_modules/.cache*" \
  -x "*node_modules/.vite*" \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.pyc" \
  -x "android/app/build/*" \
  -x "ios/App/build/*"

# Verify package creation
if [ -f "release/rishi-capacitor.zip" ]; then
    SIZE=$(du -h release/rishi-capacitor.zip | cut -f1)
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Build Summary:${NC}"
    echo "   • Package: release/rishi-capacitor.zip"
    echo "   • Size: ${SIZE}"
    echo "   • API: https://rishi-next.vercel.app"
    echo "   • Environment: Production"
    echo ""
    echo -e "${BLUE}📱 Next Steps:${NC}"
    echo "   1. Upload release/rishi-capacitor.zip to VoltBuilder"
    echo "   2. Configure signing certificates:"
    echo "      • Android: keystore alias 'rishi-android'"
    echo "      • iOS: provisioning profile 'rishi-ios-appstore'"
    echo "   3. Download APK/IPA for app store submission"
    echo ""
    echo -e "${GREEN}🎉 Ready for production deployment!${NC}"
else
    echo -e "${RED}❌ Failed to create VoltBuilder package${NC}"
    exit 1
fi