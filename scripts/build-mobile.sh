#!/bin/bash
# Rishi Platform Mobile Build Script
# Creates VoltBuilder-ready package with proper environment separation

set -e

echo "🏗️  Building Rishi Platform for Mobile Deployment"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Create mobile build directory
MOBILE_DIR="mobile-build"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
PACKAGE_NAME="rishi-platform-mobile-${TIMESTAMP}.zip"

echo "📱 Creating mobile build directory..."
rm -rf "${MOBILE_DIR}"
mkdir -p "${MOBILE_DIR}"

# Copy all source files except development-specific ones
echo "📂 Copying source files..."
cp -r . "${MOBILE_DIR}/"

# Remove excluded files and directories
echo "🧹 Cleaning mobile build directory..."
cd "${MOBILE_DIR}"
rm -rf .git node_modules .next out mobile-build *.zip .env.local .env.development 2>/dev/null || true
cd ..

# Create mobile-specific Next.js configuration
echo "⚙️  Configuring for mobile deployment..."
cat > "${MOBILE_DIR}/next.config.mjs" << 'EOF'
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mobile-specific configuration
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Essential configuration
  poweredByHeader: false,
  reactStrictMode: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  serverExternalPackages: ['@neondatabase/serverless'],
  
  webpack: (config, { isServer, dev }) => {
    // Path aliases for mobile build
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'app'),
      '@/lib': path.resolve(process.cwd(), 'lib'),
      '@/components': path.resolve(process.cwd(), 'components'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
      '@/shared': path.resolve(process.cwd(), 'shared'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@db': path.resolve(process.cwd(), 'db.ts'),
    };
    
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },
};

export default nextConfig;
EOF

# Create mobile-specific environment file
echo "🔧 Creating mobile environment configuration..."
cat > "${MOBILE_DIR}/.env.production" << 'EOF'
# Mobile Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# API Base URL - Points to live Vercel deployment
NEXT_PUBLIC_API_BASE_URL=https://rishi-platform.vercel.app

# Database URL for build-time static generation
DATABASE_URL=postgresql://neondb_owner:npg_Yj2qOxWd2rJX@ep-jolly-firefly-a5hckdgj.us-east-2.aws.neon.tech/rishiapp_prod?sslmode=require

# Mobile build flag
MOBILE_BUILD=true
VOLTBUILDER_BUILD=true
EOF

# Update Capacitor configuration for production
echo "📱 Updating Capacitor configuration..."
cat > "${MOBILE_DIR}/capacitor.config.ts" << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://rishi-platform.vercel.app',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a",
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    App: {
      skipNativeInitialize: false
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK",
      signingType: "jarsigner"
    }
  },
  ios: {
    scheme: "Rishi Platform"
  }
};

export default config;
EOF

# Create VoltBuilder configuration
echo "🔧 Creating VoltBuilder configuration..."
cat > "${MOBILE_DIR}/voltbuilder.json" << 'EOF'
{
  "platform": "android",
  "build": {
    "debug": false,
    "release": true
  },
  "app": {
    "id": "com.rishi.platform",
    "name": "Rishi Platform",
    "version": "1.0.0",
    "description": "Enterprise workforce management platform"
  },
  "android": {
    "minSdkVersion": 22,
    "targetSdkVersion": 34,
    "compileSdkVersion": 34
  },
  "logging": {
    "verbose": true
  }
}
EOF

# Ensure Android configuration is complete
echo "📱 Ensuring Android configuration..."
mkdir -p "${MOBILE_DIR}/android"

# Create the ZIP package
echo "📦 Creating VoltBuilder package..."
cd "${MOBILE_DIR}"
zip -r "../${PACKAGE_NAME}" . -x "*.git*" "node_modules/*" "*.DS_Store*" ".next/*" "out/*"
cd ..

# Clean up
rm -rf "${MOBILE_DIR}"

echo ""
echo "✅ Mobile build completed successfully!"
echo "📦 Package: ${PACKAGE_NAME}"
echo "📊 Size: $(ls -lh "${PACKAGE_NAME}" | awk '{print $5}')"
echo ""
echo "🚀 Upload ${PACKAGE_NAME} to VoltBuilder for native mobile compilation"
echo ""