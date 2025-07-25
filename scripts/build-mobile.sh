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

# Create development manifests first
echo "🔧 Creating development manifests..."
node scripts/create-dev-manifests.js

# Build Next.js app for static export
echo "🔨 Building Next.js application..."
npm run build

# Inject Capacitor bridge into static HTML
echo "🔋 Injecting Capacitor JavaScript bridge..."
node scripts/inject-capacitor-bridge.js

# Ensure development manifest exists after mobile build (which clears .next directory)
echo "🔧 Restoring development manifest..."
./scripts/ensure-dev-manifest.sh

# Sync with Capacitor
echo "📱 Syncing with Capacitor..."
npx cap sync

# Set output directory based on environment
case $ENVIRONMENT in
    "development")
        OUTPUT_DIR="builds/Replit Dev"
        ;;
    "staging")
        OUTPUT_DIR="builds/Replit Autoscale Staging"
        ;;
    "production")
        OUTPUT_DIR="builds/Vercel Production"
        ;;
esac

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Clean up old builds for this environment (keep only 1 current build)
echo "🧹 Cleaning up old $ENVIRONMENT builds in $OUTPUT_DIR..."
find "$OUTPUT_DIR" -name "rishi-*.zip" -type f -delete 2>/dev/null || true

# Create VoltBuilder package with proper naming
PACKAGE_NAME="rishi-$ENVIRONMENT-$TIMESTAMP.zip"
PACKAGE_PATH="$OUTPUT_DIR/$PACKAGE_NAME"

echo "📦 Creating VoltBuilder package: $PACKAGE_PATH"

zip -r "$PACKAGE_PATH" \
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
echo "📦 Package: $PACKAGE_PATH"
echo "📏 Size: $(ls -lh "$PACKAGE_PATH" | awk '{print $5}')"
echo "📁 Location: $OUTPUT_DIR/"
echo ""
echo "🚀 Next Steps:"
echo "   1. Navigate to $OUTPUT_DIR/"
echo "   2. Upload $PACKAGE_NAME to VoltBuilder"
echo "   3. Test the mobile app with $ENVIRONMENT backend"
echo "   4. Distribute to field workers"
echo ""
echo "📱 Mobile App Features:"
echo "   • App Name: $APP_NAME"
echo "   • Backend: $BACKEND_URL"
echo "   • Environment: $ENVIRONMENT"
echo "   • Full workforce management functionality"
echo "   • Native Android performance"