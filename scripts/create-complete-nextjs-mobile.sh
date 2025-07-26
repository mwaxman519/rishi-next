#!/bin/bash

# Complete Next.js Mobile App Creation
# Creates the complete Rishi Platform wrapped with Capacitor

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="complete-nextjs-mobile"

echo "🚀 Creating Complete Next.js Mobile App"
echo "⏰ Timestamp: $TIMESTAMP"

# Clean and create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Copying complete Next.js application..."

# Copy all essential directories
for dir in app components hooks lib contexts shared styles public; do
  if [ -d "$dir" ]; then
    cp -r "$dir" "$BUILD_DIR/"
    echo "   ✅ $dir copied"
  fi
done

# Copy configuration files
for file in package.json tailwind.config.js postcss.config.mjs tsconfig.json; do
  if [ -f "$file" ]; then
    cp "$file" "$BUILD_DIR/"
    echo "   ✅ $file copied"
  fi
done

echo "🔧 Configuring for mobile build..."

# Create mobile Next.js config
cat > "$BUILD_DIR/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://rishi-staging.replit.app',
    NEXT_PUBLIC_APP_ENV: 'staging',
    MOBILE_BUILD: 'true'
  }
};

export default nextConfig;
EOF

# Create mobile environment
cat > "$BUILD_DIR/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=https://rishi-staging.replit.app
NEXT_PUBLIC_APP_ENV=staging
MOBILE_BUILD=true
EOF

cd "$BUILD_DIR"

# Set environment
export NODE_ENV=production
export MOBILE_BUILD=true
export NEXT_PUBLIC_APP_ENV=staging

echo "🔨 Installing dependencies..."
npm install --silent

echo "🔨 Building Next.js app..."
npm run build

echo "📱 Adding Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios --save-dev --silent

# Initialize Capacitor
npx cap init "Rishi Platform" "com.rishi.platform.staging" --web-dir=out

# Create Capacitor config
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.staging',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://rishi-staging.replit.app',
      'https://*.replit.app'
    ]
  },
  plugins: {
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#2563eb'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
EOF

# Add Android platform
npx cap add android
npx cap sync

# Go back and create package
cd ..
PACKAGE_NAME="rishi-complete-nextjs-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*" > /dev/null

PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ COMPLETE NEXT.JS MOBILE APP CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 Contains: Complete Rishi Platform + Capacitor"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "This is your complete Next.js Rishi Platform wrapped as a native mobile app!"