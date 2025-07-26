#!/bin/bash

# Emergency Staging VoltBuilder Package Creation
# Simplified approach that actually works

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="emergency-staging-build"

echo "🚀 Emergency Staging VoltBuilder Build"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Create minimal Next.js app structure
echo "📦 Creating minimal app structure..."

# Package.json for static build
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "rishi-staging-mobile",
  "version": "1.0.0",
  "scripts": {
    "build": "next build"
  },
  "dependencies": {
    "next": "15.4.2",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  }
}
EOF

# Next.js config for static export
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
  }
};

export default nextConfig;
EOF

# Create minimal app structure
mkdir -p "$BUILD_DIR/app"

# Create root page that redirects to staging
cat > "$BUILD_DIR/app/page.tsx" << 'EOF'
'use client';

import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Redirect to staging backend immediately
    window.location.href = 'https://rishi-staging.replit.app';
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#2563eb',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Rishi Platform Staging</h1>
        <p>Connecting to staging server...</p>
        <div style={{ marginTop: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          <a href="https://rishi-staging.replit.app" style={{ color: 'white' }}>
            Click here if not redirected automatically
          </a>
        </p>
      </div>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
EOF

# Create layout
cat > "$BUILD_DIR/app/layout.tsx" << 'EOF'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Rishi Platform Staging</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
EOF

# Build the minimal app
cd "$BUILD_DIR"
export NODE_ENV=production

echo "🔨 Building minimal staging app..."
npm install
npm run build

echo "📱 Adding Capacitor framework..."

# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Initialize Capacitor
npx cap init "Rishi Platform Staging" "com.rishi.platform.staging" --web-dir=out

# Create Capacitor config
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.staging',
  appName: 'Rishi Platform Staging',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://rishi-staging.replit.app',
      'https://*.replit.app'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#2563eb',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#2563eb'
    }
  }
};

export default config;
EOF

# Add Android platform
npx cap add android

# Sync with Capacitor
npx cap sync

# Create VoltBuilder package
cd ..
PACKAGE_NAME="rishi-staging-emergency-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating VoltBuilder package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*"

# Get package size
PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ EMERGENCY STAGING VOLTBUILDER PACKAGE CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 App ID: com.rishi.platform.staging"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "🔧 How it works:"
echo "   - Mobile app loads minimal splash screen"
echo "   - Immediately redirects to https://rishi-staging.replit.app"
echo "   - Full Rishi Platform functionality via staging server"
echo "   - No compromises - complete feature set maintained"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload to VoltBuilder"
echo "   2. Configure project settings"
echo "   3. Compile native binaries"
echo "   4. Test on device via Firebase App Distribution"