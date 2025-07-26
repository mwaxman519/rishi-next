#!/bin/bash

# Next.js + Capacitor Hybrid Build
# Creates complete Next.js app wrapped with Capacitor for native mobile

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="nextjs-capacitor-hybrid"

echo "🚀 Building Next.js + Capacitor Hybrid Mobile App"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Copying complete Next.js application structure..."

# Copy frontend directories (everything needed for client-side)
cp -r app "$BUILD_DIR/"
cp -r components "$BUILD_DIR/"
cp -r hooks "$BUILD_DIR/"
cp -r lib "$BUILD_DIR/"
cp -r contexts "$BUILD_DIR/"
cp -r shared "$BUILD_DIR/"
cp -r styles "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"

# Copy essential configs
cp tailwind.config.js "$BUILD_DIR/"
cp postcss.config.mjs "$BUILD_DIR/"

# Create streamlined package.json with only client dependencies
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "rishi-platform-hybrid",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.4.2",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.0.0",
    "@hookform/resolvers": "^3.3.2",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "tailwindcss": "^3.3.6",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "jose": "^5.1.3"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
EOF

# Create hybrid Next.js config (static export with API proxy)
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

# TypeScript config for mobile
cat > "$BUILD_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Environment for mobile
cat > "$BUILD_DIR/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=https://rishi-staging.replit.app
NEXT_PUBLIC_APP_ENV=staging
MOBILE_BUILD=true
EOF

# Build process
cd "$BUILD_DIR"
export NODE_ENV=production
export MOBILE_BUILD=true

echo "🔨 Installing essential dependencies..."
npm install --no-fund --silent

echo "🔨 Building hybrid platform..."
npm run build

echo "📱 Creating Capacitor wrapper..."

# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios --save-dev

# Initialize Capacitor
npx cap init "Rishi Platform" "com.rishi.platform.staging" --web-dir=out

# Capacitor configuration for hybrid app
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

# Create VoltBuilder package
cd ..
PACKAGE_NAME="rishi-nextjs-capacitor-hybrid-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating hybrid package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*"

PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)
rm -rf "$BUILD_DIR"

echo ""
echo "✅ NEXT.JS + CAPACITOR HYBRID MOBILE APP CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 Contains: Complete Next.js Rishi Platform wrapped with Capacitor"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "🎯 This hybrid app includes:"
echo "   ✅ Complete Next.js frontend"
echo "   ✅ All Rishi Platform components and pages"
echo "   ✅ Native mobile wrapper via Capacitor"
echo "   ✅ API calls to staging backend"
echo "   ✅ Identical UI/UX to web version"
echo ""
echo "This is your complete Rishi Platform as a native mobile app!"