#!/bin/bash

# Quick VoltBuilder Build Script
# Uses existing package for immediate deployment

echo "⚡ Quick VoltBuilder Deployment"
echo "=============================="

PACKAGE_PATH="builds/staging/rishi-staging-fullscreen-2025-07-27-2224.zip"
PLATFORMS=${1:-android}

if [ ! -f "$PACKAGE_PATH" ]; then
    echo "❌ Package not found: $PACKAGE_PATH"
    echo "🔧 Creating new package..."
    ./scripts/build-and-deploy-mobile.sh staging $PLATFORMS
    exit $?
fi

echo "📦 Using existing package: $PACKAGE_PATH"
echo "📱 Platforms: $PLATFORMS"
echo ""

echo "🚀 Uploading to VoltBuilder with API automation..."
node scripts/voltbuilder-api.js "$PACKAGE_PATH" "$PLATFORMS"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 VoltBuilder deployment completed!"
    echo "📱 Your mobile apps are building in the cloud"
    echo "🌐 Monitor progress: https://voltbuilder.com/"
else
    echo "❌ VoltBuilder deployment failed"
    exit 1
fi