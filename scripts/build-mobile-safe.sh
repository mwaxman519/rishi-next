#!/bin/bash

# Safe Mobile Build Script for VoltBuilder
# This script creates a VoltBuilder package without corrupting the development environment

set -e

ENV=${1:-development}
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="mobile-build-temp"

echo "🚀 Building Rishi Platform Mobile App (SAFE VERSION)"
echo "📱 Environment: $ENV"
echo "⏰ Build Time: $TIMESTAMP"

# Load environment configuration
if [[ "$ENV" == "development" ]]; then
    APP_NAME="Rishi Platform Dev"
    APP_ID="com.rishi.platform.dev"
    BACKEND_URL="https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev"
    ENV_FILE=".env.development"
elif [[ "$ENV" == "staging" ]]; then
    APP_NAME="Rishi Platform Staging"
    APP_ID="com.rishi.platform.staging"
    BACKEND_URL="https://rishi-staging.replit.app"
    ENV_FILE=".env.staging"
else
    APP_NAME="Rishi Platform"
    APP_ID="com.rishi.platform"
    BACKEND_URL="https://rishi-platform.vercel.app"
    ENV_FILE=".env.production"
fi

echo "📋 Build Configuration:"
echo "   App Name: $APP_NAME"
echo "   App ID: $APP_ID"
echo "   Backend: $BACKEND_URL"

# Create temporary build directory
echo "📁 Creating temporary build directory..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Copy project files to build directory
echo "📋 Copying project files..."
cp -r . $BUILD_DIR/
cd $BUILD_DIR
rm -rf .next node_modules builds mobile-build-temp

# Switch to build directory
cd $BUILD_DIR

# Configure Capacitor for the environment
echo "⚙️ Configuring Capacitor for $ENV..."
cp "capacitor.config.$ENV.ts" capacitor.config.ts

# Load environment variables
echo "📄 Loading environment variables from $ENV_FILE"
if [[ -f "$ENV_FILE" ]]; then
    export $(grep -v '^#' $ENV_FILE | xargs)
fi

# Set VoltBuilder build environment
export NODE_ENV=production
export MOBILE_BUILD=true
export VOLTBUILDER_BUILD=true
export DATABASE_URL="sqlite::memory:"

# Build Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync android

# Create VoltBuilder package
PACKAGE_NAME="rishi-voltbuilder-$ENV-$TIMESTAMP.zip"
echo "📦 Creating VoltBuilder package: $PACKAGE_NAME"

# Create zip with proper structure for VoltBuilder
zip -r "../builds/Replit Dev/$PACKAGE_NAME" \
    android/ \
    out/ \
    capacitor.config.ts \
    package.json \
    voltbuilder.json \
    -x "*.log" "**/node_modules/**" "**/.git/**"

# Cleanup
cd ..
rm -rf $BUILD_DIR

echo "✅ Mobile build completed successfully!"
echo "📦 Package created: builds/Replit Dev/$PACKAGE_NAME"
echo "🚀 Ready for VoltBuilder upload!"