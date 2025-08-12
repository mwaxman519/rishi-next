#!/bin/bash

# Rishi Platform Native Build Script
# Creates a VoltBuilder-ready package

set -e

echo "🚀 Rishi Platform Native Build Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"
rm -rf out .next-static release

# Create release directory if it doesn't exist
mkdir -p release

# Build the static Next.js app with static export
echo -e "${YELLOW}🔨 Building Next.js static export...${NC}"

# Set environment for production build
export NODE_ENV=production
export NEXT_PUBLIC_API_BASE_URL=https://rishi-next.vercel.app

# Use the voltbuilder configuration for static export
if [ -f "next.config.voltbuilder.mjs" ]; then
    # Copy the voltbuilder config temporarily
    cp next.config.mjs next.config.mjs.original
    cp next.config.voltbuilder.mjs next.config.mjs
    npx next build
    # Restore original config
    mv next.config.mjs.original next.config.mjs
else
    # Fallback to regular build with output: 'export'
    npx next build
fi

# Check if build was successful
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Build failed: 'out' directory not found${NC}"
    exit 1
fi

# Copy files to Capacitor
echo -e "${YELLOW}📋 Copying files to Capacitor...${NC}"
npx cap copy

# Sync Capacitor
echo -e "${YELLOW}🔄 Syncing Capacitor...${NC}"
npx cap sync

# Create the zip package
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
  -x "*.pyc"

# Check if zip was created
if [ -f "release/rishi-capacitor.zip" ]; then
    # Get file size
    SIZE=$(du -h release/rishi-capacitor.zip | cut -f1)
    echo -e "${GREEN}✅ VoltBuilder package created successfully!${NC}"
    echo -e "${GREEN}📦 Package: release/rishi-capacitor.zip (${SIZE})${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Upload release/rishi-capacitor.zip to VoltBuilder"
    echo "2. Configure signing with VoltSigner"
    echo "3. Build and download your APK/IPA"
else
    echo -e "${RED}❌ Failed to create zip package${NC}"
    exit 1
fi