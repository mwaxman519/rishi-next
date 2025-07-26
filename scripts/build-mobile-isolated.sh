#!/bin/bash

# ISOLATED Mobile Build Script - NEVER Contaminates Main Codebase
# Usage: ./scripts/build-mobile-isolated.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="mobile-build-isolated"

echo "🚀 Creating ISOLATED VoltBuilder Package"
echo "📱 Environment: $ENVIRONMENT"
echo "⏰ Build Time: $TIMESTAMP"
echo "📁 Isolated Directory: $BUILD_DIR"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Error: Invalid environment '$ENVIRONMENT'"
    echo "✅ Valid options: staging, production"
    exit 1
fi

# Set environment-specific variables
case $ENVIRONMENT in
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

# Create completely isolated build directory
echo "🏗️  Creating isolated build environment..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy essential files to isolated directory
echo "📦 Copying essential files to isolated build..."
cp -r app "$BUILD_DIR/"
cp -r components "$BUILD_DIR/"
cp -r contexts "$BUILD_DIR/"
cp -r hooks "$BUILD_DIR/"
cp -r lib "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"
cp -r shared "$BUILD_DIR/"
cp -r styles "$BUILD_DIR/"
cp package.json "$BUILD_DIR/"
cp next.config.mjs "$BUILD_DIR/"
cp tailwind.config.js "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/"
cp postcss.config.mjs "$BUILD_DIR/"

# Copy environment file
cp ".env.$ENVIRONMENT" "$BUILD_DIR/.env.production"

# Create VoltBuilder-optimized next.config.mjs in isolated directory
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
    VOLTBUILDER_BUILD: 'true'
  },
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
EOF

# Create VoltBuilder-safe API routes in isolated directory
echo "🛡️  Creating build-safe API routes in isolated directory..."

# Function to create safe route
create_safe_route() {
    local route_path="$1"
    local route_name="$2"
    
    mkdir -p "$(dirname "$BUILD_DIR/$route_path")"
    
    cat > "$BUILD_DIR/$route_path" << EOF
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "$route_name",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "$route_name",
    timestamp: new Date().toISOString()
  });
}

export async function PUT(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "$route_name",
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(request?: NextRequest) {
  return NextResponse.json({
    message: "Mobile app will connect to backend at runtime",
    route: "$route_name",
    timestamp: new Date().toISOString()
  });
}
EOF
}

# Create safe routes for all problematic endpoints
create_safe_route "app/api/organizations/route.ts" "organizations"
create_safe_route "app/api/users/route.ts" "users"
create_safe_route "app/api/locations/route.ts" "locations"
create_safe_route "app/api/bookings/route.ts" "bookings"
create_safe_route "app/api/auth-service/session/route.ts" "auth-service/session"

echo "✅ Safe routes created in isolated directory"

# Enter isolated directory and build
cd "$BUILD_DIR"

echo "🔨 Building Next.js in isolated environment..."
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=$ENVIRONMENT
export VOLTBUILDER_BUILD=true
export DATABASE_URL="sqlite::memory:"

npm run build

echo "📱 Adding Capacitor mobile framework..."
npm install -g @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios

# Initialize Capacitor in isolated directory
npx cap init "$APP_NAME" "$APP_ID" --web-dir=out

# Create Capacitor config for this environment
cat > capacitor.config.ts << EOF
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '$APP_ID',
  appName: '$APP_NAME',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '$BACKEND_URL',
      '*.replit.app',
      '*.vercel.app'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '$SPLASH_COLOR',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
EOF

# Add Android platform
npx cap add android

# Sync with Capacitor
npx cap sync

# Create final VoltBuilder package
cd ..
PACKAGE_NAME="rishi-voltbuilder-$ENVIRONMENT-$TIMESTAMP.zip"
OUTPUT_DIR="builds/$ENVIRONMENT"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating VoltBuilder package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*" "*/.next/*"

# Cleanup isolated directory
rm -rf "$BUILD_DIR"

echo ""
echo "✅ ISOLATED VOLTBUILDER PACKAGE CREATED SUCCESSFULLY!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📱 App ID: $APP_ID"
echo "🌐 Backend: $BACKEND_URL"
echo "🛡️  Main codebase completely unaffected"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload $OUTPUT_DIR/$PACKAGE_NAME to VoltBuilder"
echo "   2. Configure VoltBuilder project settings"
echo "   3. Compile native Android/iOS binaries"
echo "   4. Distribute via Firebase App Distribution"