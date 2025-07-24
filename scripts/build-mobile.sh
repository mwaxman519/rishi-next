#!/bin/bash

# Mobile Build Script - Industry Standard Multi-Environment Support
# Usage: ./scripts/build-mobile.sh [development|staging|production]

set -e

ENVIRONMENT=${1:-development}
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")

echo "🚀 Building Rishi Platform Mobile App"
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

# Copy environment-specific Capacitor config
echo "⚙️  Configuring Capacitor for $ENVIRONMENT..."
cp "capacitor.config.$ENVIRONMENT.ts" capacitor.config.ts

# Set environment variables for build
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=$ENVIRONMENT
export MOBILE_BUILD=true

# Load environment-specific variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo "📄 Loading environment variables from .env.$ENVIRONMENT"
    export $(cat ".env.$ENVIRONMENT" | grep -v '^#' | xargs)
fi

# Build Next.js app for static export
echo "🔨 Building Next.js application..."
npm run build

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync

# Clean up old builds for this environment
echo "🧹 Cleaning up old $ENVIRONMENT builds..."
find . -maxdepth 1 -name "rishi-mobile-$ENVIRONMENT-*.zip" -type f -delete 2>/dev/null || true
find . -maxdepth 1 -name "rishi-voltbuilder-*$ENVIRONMENT*.zip" -type f -delete 2>/dev/null || true

# Create VoltBuilder package
PACKAGE_NAME="rishi-mobile-$ENVIRONMENT-$TIMESTAMP.zip"

echo "📦 Creating VoltBuilder package: $PACKAGE_NAME"

zip -r "$PACKAGE_NAME" \
    android/ \
    out/ \
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
echo ""
echo "🚀 Next Steps:"
echo "   1. Upload $PACKAGE_NAME to VoltBuilder"
echo "   2. Test the mobile app with $ENVIRONMENT backend"
echo "   3. Distribute to field workers"
echo ""
echo "📱 Mobile App Features:"
echo "   • App Name: $APP_NAME"
echo "   • Backend: $BACKEND_URL"
echo "   • Environment: $ENVIRONMENT"
echo "   • Full workforce management functionality"
echo "   • Native Android performance"