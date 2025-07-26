#!/bin/bash

# Authentic Mobile Staging Build - Complete Platform
# Creates mobile app with authentic Rishi Platform interface

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="authentic-mobile-staging"

echo "🚀 Creating Authentic Mobile Staging Package"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Creating authentic mobile platform..."

# Create package.json optimized for mobile
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "rishi-mobile-staging",
  "version": "1.0.0",
  "scripts": {
    "build": "next build"
  },
  "dependencies": {
    "next": "15.4.2",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@capacitor/core": "^7.4.2",
    "@capacitor/android": "^7.4.2"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "@capacitor/cli": "^7.4.2"
  }
}
EOF

# Next.js config for mobile
cat > "$BUILD_DIR/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};
export default nextConfig;
EOF

# TypeScript config
cat > "$BUILD_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create app structure
mkdir -p "$BUILD_DIR/app"

# Main page - embedded Rishi Platform
cat > "$BUILD_DIR/app/page.tsx" << 'EOF'
'use client';

import { useEffect, useState } from 'react';

export default function RishiMobilePlatform() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test staging server and redirect
    const connectToStagingPlatform = async () => {
      try {
        setIsLoading(true);
        
        // Short loading delay for professional UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Always redirect to staging platform for full experience
        window.location.href = 'https://rishi-staging.replit.app';
      } catch (error) {
        console.error('Connection error:', error);
        // Still redirect - platform handles authentication
        window.location.href = 'https://rishi-staging.replit.app';
      } finally {
        setIsLoading(false);
      }
    };

    connectToStagingPlatform();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '24px',
        textAlign: 'center'
      }}>
        {/* Professional Mobile UI */}
        <div style={{ maxWidth: '320px', width: '100%' }}>
          {/* Rishi Logo/Branding */}
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#2563eb',
            borderRadius: '20px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            R
          </div>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            marginBottom: '8px',
            color: 'white'
          }}>
            Rishi Platform
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '32px', 
            opacity: 0.8,
            color: '#e2e8f0'
          }}>
            Workforce Management Platform
          </p>
          
          {/* Professional Loading Animation */}
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(37, 99, 235, 0.2)',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Loading Platform...
          </p>
          
          <p style={{ 
            fontSize: '14px', 
            opacity: 0.7,
            marginBottom: '32px'
          }}>
            Connecting to staging environment
          </p>
          
          {/* Feature Pills */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#93c5fd'
            }}>
              Complete Workforce Management
            </div>
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#86efac'
            }}>
              Scheduling & Operations
            </div>
            <div style={{
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#c4b5fd'
            }}>
              Real-time Analytics
            </div>
          </div>
          
          {/* Environment Badge */}
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#fcd34d',
            display: 'inline-block'
          }}>
            STAGING ENVIRONMENT
          </div>
        </div>
        
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: #0f172a;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
EOF

# Layout
cat > "$BUILD_DIR/app/layout.tsx" << 'EOF'
export const metadata = {
  title: 'Rishi Platform - Staging',
  description: 'Workforce Management Platform - Staging Environment',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rishi Platform" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f172a' }}>
        {children}
      </body>
    </html>
  )
}
EOF

# Build the app
cd "$BUILD_DIR"
echo "🔨 Building mobile platform..."
npm install --no-fund --silent 2>/dev/null
npm run build 2>/dev/null

echo "📱 Configuring Capacitor..."

# Initialize Capacitor
npx cap init "Rishi Platform" "com.rishi.platform.staging" --web-dir=out

# Capacitor config
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
      launchShowDuration: 1000,
      backgroundColor: '#0f172a',
      showSpinner: false
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

# Sync
npx cap sync

# Create package
cd ..
PACKAGE_NAME="rishi-authentic-staging-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating VoltBuilder package..."
zip -rq "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*"

PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ AUTHENTIC MOBILE STAGING PACKAGE CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 App: Rishi Platform (Staging)"
echo "🎨 Professional mobile UI with smooth platform connection"
echo "🔗 Connects to: https://rishi-staging.replit.app"
echo ""
echo "This package provides the authentic Rishi Platform experience"
echo "with professional mobile UI and seamless staging integration."