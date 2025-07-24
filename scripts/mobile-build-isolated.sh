#!/bin/bash

# Isolated Mobile Build Script - Doesn't interfere with dev server
# Usage: ./scripts/mobile-build-isolated.sh [development|staging|production]

set -e

ENVIRONMENT=${1:-development}
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")

echo "🚀 Building Rishi Platform Mobile App (Isolated)"
echo "📱 Environment: $ENVIRONMENT"
echo "⏰ Build Time: $TIMESTAMP"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Error: Invalid environment '$ENVIRONMENT'"
    echo "✅ Valid options: development, staging, production"
    exit 1
fi

# Set environment-specific variables
case $ENVIRONMENT in
    "development")
        APP_NAME="Rishi Platform Dev"
        APP_ID="com.rishi.platform.dev"
        BACKEND_URL="https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev"
        SPLASH_COLOR="#1a1a1a"
        ;;
    "staging")
        APP_NAME="Rishi Platform Staging"
        APP_ID="com.rishi.platform.staging"
        BACKEND_URL="https://rishi-staging.replit.app"
        SPLASH_COLOR="#2563eb"
        ;;
    "production")
        APP_NAME="Rishi Platform" 
        APP_ID="com.rishi.platform"
        BACKEND_URL="https://rishi-platform.vercel.app"
        SPLASH_COLOR="#16a34a"
        ;;
esac

echo "📋 Build Configuration:"
echo "   App Name: $APP_NAME"
echo "   App ID: $APP_ID"
echo "   Backend: $BACKEND_URL"
echo ""

# Preserve dev server .next directory
echo "💾 Preserving development server state..."
if [ -d ".next" ]; then
    cp -r .next .next-dev-backup
    echo "✅ Development server state backed up"
fi

# Copy environment-specific Capacitor config
echo "⚙️  Configuring Capacitor for $ENVIRONMENT..."
cp "capacitor.config.$ENVIRONMENT.ts" capacitor.config.ts

# Create isolated mobile output directory
MOBILE_OUT="mobile-out"
echo "🧹 Setting up isolated mobile build directory..."
rm -rf "$MOBILE_OUT"
mkdir -p "$MOBILE_OUT"

# Set environment variables for mobile build
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=$ENVIRONMENT
export MOBILE_BUILD=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Load environment-specific variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📄 Loading environment variables from .env.$ENVIRONMENT"
    export $(cat ".env.$ENVIRONMENT" | grep -v '^#' | xargs)
fi

# Build Next.js to isolated directory
echo "🔨 Building Next.js application (isolated)..."
timeout 600 npx next build --build-id mobile-$TIMESTAMP || {
    echo "❌ Build timed out or failed"
    # Restore dev server state
    if [ -d ".next-dev-backup" ]; then
        rm -rf .next
        mv .next-dev-backup .next
        echo "✅ Development server state restored"
    fi
    exit 1
}

# Move build output to isolated directory
if [ -d "out" ]; then
    mv out "$MOBILE_OUT/"
    echo "✅ Mobile build output moved to $MOBILE_OUT/out/"
else
    echo "❌ Build failed - out directory not created"
    # Restore dev server state
    if [ -d ".next-dev-backup" ]; then
        rm -rf .next
        mv .next-dev-backup .next
        echo "✅ Development server state restored"
    fi
    exit 1
fi

# Restore development server state
echo "🔄 Restoring development server state..."
if [ -d ".next-dev-backup" ]; then
    rm -rf .next
    mv .next-dev-backup .next
    echo "✅ Development server state restored"
fi

# Ensure dev manifests exist
./scripts/ensure-dev-manifest.sh

# Sync with Capacitor using isolated output
echo "📱 Syncing with Capacitor..."
# Temporarily symlink mobile output for Capacitor
ln -sf "$MOBILE_OUT/out" out
npx cap sync
rm -f out  # Remove symlink

# Clean up old builds for this environment
echo "🧹 Cleaning up old $ENVIRONMENT builds..."
find . -maxdepth 1 -name "rishi-mobile-$ENVIRONMENT-*.zip" -type f -delete 2>/dev/null || true

# Create VoltBuilder package
PACKAGE_NAME="rishi-mobile-$ENVIRONMENT-$TIMESTAMP.zip"

echo "📦 Creating VoltBuilder package: $PACKAGE_NAME"

zip -r "$PACKAGE_NAME" \
    android/ \
    "$MOBILE_OUT/out/" \
    capacitor.config.ts \
    voltbuilder.json \
    -x "android/node_modules/*" \
    -x "android/.gradle/*" \
    -x "android/build/*" \
    -x "android/app/build/*" \
    >/dev/null 2>&1

echo ""
echo "✅ Mobile app build completed successfully!"
echo "📦 Package: $PACKAGE_NAME"
echo "📏 Size: $(ls -lh "$PACKAGE_NAME" | awk '{print $5}')"
echo "📂 Mobile output preserved in: $MOBILE_OUT/"
echo ""
echo "🚀 Next Steps:"
echo "   1. Upload $PACKAGE_NAME to VoltBuilder"
echo "   2. Test the mobile app with $ENVIRONMENT backend"
echo "   3. Distribute to field workers"