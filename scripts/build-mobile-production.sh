#!/bin/bash

# Rishi Platform - Mobile Build Script for Production/Vercel Environment
# Creates VoltBuilder-ready package for Android/iOS compilation using production database

set -e

echo "🚀 Building Rishi Platform Mobile App for PRODUCTION Environment"
echo "==============================================================="

# Environment validation
if [ -z "$PRODUCTION_DATABASE_URL" ]; then
    echo "❌ ERROR: PRODUCTION_DATABASE_URL environment variable is required"
    echo "Please set production database URL before running mobile build"
    exit 1
fi

echo "✅ Production database URL validated"

# Clean previous builds
echo "🧹 Cleaning previous mobile builds..."
rm -rf mobile-production-build/
rm -rf out/
rm -rf .next/
rm -f rishi-mobile-production-*.zip

# Create production build directory
mkdir -p mobile-production-build

echo "📱 Configuring mobile environment for PRODUCTION..."

# Create production environment file
cat > mobile-production-build/.env.production << EOF
# Rishi Platform Mobile - Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# Database Configuration - PRODUCTION
DATABASE_URL=${PRODUCTION_DATABASE_URL}

# API Configuration
NEXT_PUBLIC_API_URL=https://rishi-platform.vercel.app
NEXT_PUBLIC_BASE_URL=https://rishi-platform.vercel.app

# Mobile Build Markers
IS_MOBILE_BUILD=true
CAPACITOR_BUILD=true
VOLTBUILDER_BUILD=true

# Security Configuration
NEXTAUTH_URL=https://rishi-platform.vercel.app
NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-production-mobile-secret-key}

# Feature Flags for Mobile
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_NATIVE_FEATURES=true

# Production Optimizations
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ERROR_REPORTING_ENABLED=true
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
EOF

echo "📦 Copying application files..."

# Copy core application files
cp -r app/ mobile-production-build/
cp -r components/ mobile-production-build/
cp -r lib/ mobile-production-build/
cp -r shared/ mobile-production-build/
cp -r styles/ mobile-production-build/
cp -r services/ mobile-production-build/
cp -r contexts/ mobile-production-build/
cp -r hooks/ mobile-production-build/
cp -r public/ mobile-production-build/

# Copy configuration files
cp package.json mobile-production-build/
cp tsconfig.json mobile-production-build/
cp tailwind.config.js mobile-production-build/
cp drizzle.config.ts mobile-production-build/

# Create mobile-specific Next.js configuration for production
cat > mobile-production-build/next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor compatibility
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Production optimizations
  compress: true,
  generateEtags: true,
  
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
  
  // Production settings
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Bundle optimization for mobile
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Webpack configuration for mobile production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
EOF

# Create Capacitor configuration for production
cat > mobile-production-build/capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.app',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    url: 'https://rishi-platform.vercel.app',
    cleartext: false
  },
  plugins: {
    App: {
      launchShowDuration: 2000
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7c3aed",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#7c3aed"
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7c3aed",
      sound: "beep.wav"
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'none'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false
  }
};

export default config;
EOF

# Create Android directory structure
echo "🤖 Setting up Android configuration..."
mkdir -p mobile-production-build/android/app/src/main/assets/public
mkdir -p mobile-production-build/android/app/src/main/res/values

# Android app configuration for production
cat > mobile-production-build/android/app/src/main/res/values/strings.xml << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Rishi Platform</string>
    <string name="title_activity_main">Rishi Platform</string>
    <string name="package_name">com.rishiplatform.app</string>
    <string name="custom_url_scheme">com.rishiplatform.app</string>
</resources>
EOF

# iOS configuration for production
echo "🍎 Setting up iOS configuration..."
mkdir -p mobile-production-build/ios/App/App

cat > mobile-production-build/ios/App/App/Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Rishi Platform</string>
    <key>CFBundleIdentifier</key>
    <string>com.rishiplatform.app</string>
    <key>CFBundleName</key>
    <string>RishiPlatform</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
EOF

echo "🔧 Building Next.js static export..."
cd mobile-production-build

# Install dependencies and build
npm install --silent
npm run build

echo "📱 Configuring Capacitor assets..."

# Copy required Capacitor files
cp -r out/* android/app/src/main/assets/public/ 2>/dev/null || true

# Create capacitor.config.json for VoltBuilder
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.rishiplatform.app",
  "appName": "Rishi Platform",
  "webDir": "out",
  "server": {
    "url": "https://rishi-platform.vercel.app",
    "cleartext": false
  }
}
EOF

cd ..

# Create VoltBuilder package
echo "📦 Creating VoltBuilder package..."
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
PACKAGE_NAME="rishi-mobile-production-${TIMESTAMP}.zip"

cd mobile-production-build
zip -r "../${PACKAGE_NAME}" \
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

cd ..

echo ""
echo "🎉 MOBILE PRODUCTION BUILD COMPLETED SUCCESSFULLY!"
echo "==============================================="
echo "Package: ${PACKAGE_NAME}"
echo "Size: $(ls -lh "${PACKAGE_NAME}" | awk '{print $5}')"
echo ""
echo "📱 VoltBuilder Configuration:"
echo "   • App ID: com.rishiplatform.app"
echo "   • App Name: Rishi Platform"
echo "   • Backend: https://rishi-platform.vercel.app"
echo "   • Database: Production Neon PostgreSQL"
echo ""
echo "🚀 Ready for VoltBuilder Upload:"
echo "   1. Upload ${PACKAGE_NAME} to https://voltbuilder.com/"
echo "   2. Select Android/iOS compilation"
echo "   3. Download native app files"
echo ""
echo "✅ Environment Separation Maintained:"
echo "   • Uses production database (not development)"
echo "   • Points to production API endpoints"
echo "   • Isolated from development environment"
echo "   • Production optimizations enabled"