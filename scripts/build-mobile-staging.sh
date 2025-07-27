#!/bin/bash

# Rishi Platform - Mobile Build Script for Staging/Autoscale Environment
# Creates VoltBuilder-ready package for Android/iOS compilation using staging database

set -e

echo "🚀 Building Rishi Platform Mobile App for STAGING Environment"
echo "================================================================"

# Environment validation
if [ -z "$STAGING_DATABASE_URL" ]; then
    echo "❌ ERROR: STAGING_DATABASE_URL environment variable is required"
    echo "Please set staging database URL before running mobile build"
    exit 1
fi

echo "✅ Staging database URL validated"

# Clean previous builds
echo "🧹 Cleaning previous mobile builds..."
rm -rf mobile-builds/staging/
rm -rf out/
rm -rf .next/
rm -f mobile-builds/staging/*.zip

# Create staging build directory
BUILD_DIR="mobile-builds/staging"
mkdir -p "$BUILD_DIR"
echo "📦 Using build directory: $BUILD_DIR"

echo "📱 Configuring mobile environment for STAGING..."

# Create staging environment file
cat > "$BUILD_DIR/.env.production" << EOF
# Rishi Platform Mobile - Staging Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging

# Database Configuration - STAGING
DATABASE_URL=${STAGING_DATABASE_URL}

# API Configuration
NEXT_PUBLIC_API_URL=https://rishi-staging.replit.app
NEXT_PUBLIC_BASE_URL=https://rishi-staging.replit.app

# Mobile Build Markers
IS_MOBILE_BUILD=true
CAPACITOR_BUILD=true
VOLTBUILDER_BUILD=true

# Security Configuration
NEXTAUTH_URL=https://rishi-staging.replit.app
NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-staging-mobile-secret-key}

# Feature Flags for Mobile
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_NATIVE_FEATURES=true
EOF

echo "📦 Copying application files..."

# Copy core application files
cp -r app/ "$BUILD_DIR/"
cp -r components/ "$BUILD_DIR/"
cp -r lib/ "$BUILD_DIR/"
cp -r shared/ "$BUILD_DIR/"
cp -r styles/ "$BUILD_DIR/"
cp -r services/ "$BUILD_DIR/"
cp -r contexts/ "$BUILD_DIR/"
cp -r hooks/ "$BUILD_DIR/"
cp -r public/ "$BUILD_DIR/"

# Copy configuration files
cp package.json "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/"
cp tailwind.config.js "$BUILD_DIR/"
cp drizzle.config.ts "$BUILD_DIR/"

# Create mobile-specific Next.js configuration
cat > "$BUILD_DIR/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor compatibility
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Disable features incompatible with static export
  images: {
    unoptimized: true,
  },
  
  // Environment configuration
  env: {
    IS_MOBILE_BUILD: 'true',
    CAPACITOR_BUILD: 'true',
    VOLTBUILDER_BUILD: 'true',
  },
  
  // Optimize for mobile
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  
  // Webpack configuration for mobile
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
EOF

# Create Capacitor configuration for staging
cat > "$BUILD_DIR/capacitor.config.ts" << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.staging',
  appName: 'Rishi Platform (Staging)',
  webDir: 'out',
  server: {
    url: 'https://rishi-staging.replit.app',
    cleartext: false
  },
  plugins: {
    App: {
      launchShowDuration: 3000
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#7c3aed",
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#7c3aed"
    },
    Keyboard: {
      resize: 'body'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7c3aed"
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
EOF

# Create Android directory structure
echo "🤖 Setting up Android configuration..."
mkdir -p "$BUILD_DIR/android/app/src/main/assets/public"
mkdir -p "$BUILD_DIR/android/app/src/main/res/values"

# Android app configuration
cat > "$BUILD_DIR/android/app/src/main/res/values/strings.xml" << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Rishi Platform (Staging)</string>
    <string name="title_activity_main">Rishi Platform (Staging)</string>
    <string name="package_name">com.rishiplatform.staging</string>
    <string name="custom_url_scheme">com.rishiplatform.staging</string>
</resources>
EOF

# iOS configuration
echo "🍎 Setting up iOS configuration..."
mkdir -p "$BUILD_DIR/ios/App/App"

cat > "$BUILD_DIR/ios/App/App/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Rishi Platform (Staging)</string>
    <key>CFBundleIdentifier</key>
    <string>com.rishiplatform.staging</string>
    <key>CFBundleName</key>
    <string>RishiStaging</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
</dict>
</plist>
EOF

echo "🔧 Building Next.js static export..."
cd "$BUILD_DIR"

# Install dependencies and build
npm install --silent
npm run build

echo "📱 Configuring Capacitor assets..."

# Copy required Capacitor files
cp -r out/* android/app/src/main/assets/public/ 2>/dev/null || true

# Create capacitor.config.json for VoltBuilder
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.rishiplatform.staging",
  "appName": "Rishi Platform (Staging)",
  "webDir": "out",
  "server": {
    "url": "https://rishi-staging.replit.app",
    "cleartext": false
  }
}
EOF

cd ..

# Create VoltBuilder package
echo "📦 Creating VoltBuilder package..."
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
PACKAGE_NAME="mobile-builds/staging/rishi-mobile-staging-${TIMESTAMP}.zip"

zip -r "${PACKAGE_NAME}" \
  android/ \
  ios/ \
  out/ \
  capacitor.config.ts \
  capacitor.config.json \
  package.json \
  .env.production \
  -x "node_modules/*" \
  -x ".next/*" \
  -x "*.log" >/dev/null 2>&1

cd ../..

echo ""
echo "🎉 MOBILE STAGING BUILD COMPLETED SUCCESSFULLY!"
echo "=============================================="
echo "Package: ${PACKAGE_NAME}"
echo "Size: $(ls -lh "${PACKAGE_NAME}" | awk '{print $5}')"
echo ""
echo "📱 VoltBuilder Configuration:"
echo "   • App ID: com.rishiplatform.staging"
echo "   • App Name: Rishi Platform (Staging)"
echo "   • Backend: https://rishi-staging.replit.app"
echo "   • Database: Staging Neon PostgreSQL"
echo ""
echo "🚀 Ready for VoltBuilder Upload:"
echo "   1. Upload ${PACKAGE_NAME} to https://voltbuilder.com/"
echo "   2. Select Android/iOS compilation"
echo "   3. Download native app files"
echo ""
echo "✅ Environment Separation Maintained:"
echo "   • Uses staging database (not development)"
echo "   • Points to staging API endpoints"
echo "   • Isolated from development environment"