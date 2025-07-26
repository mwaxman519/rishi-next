#!/bin/bash

# Full Staging Mobile VoltBuilder Build - Complete Platform Interface
# Creates mobile app with full Rishi Platform UI and staging backend

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="full-staging-mobile-build"

echo "🚀 Building FULL Staging Mobile VoltBuilder Package"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Creating complete mobile platform with full UI..."

# Copy complete frontend structure
echo "📁 Copying complete frontend..."
cp -r app "$BUILD_DIR/"
cp -r components "$BUILD_DIR/"
cp -r hooks "$BUILD_DIR/"
cp -r lib "$BUILD_DIR/"
cp -r contexts "$BUILD_DIR/"
cp -r shared "$BUILD_DIR/"
cp -r styles "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"

# Package.json with all required dependencies
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "rishi-staging-mobile-full",
  "version": "1.0.0",
  "scripts": {
    "build": "next build"
  },
  "dependencies": {
    "next": "15.4.2",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@capacitor/core": "^7.4.2",
    "@capacitor/android": "^7.4.2",
    "@capacitor/ios": "^7.4.2",
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
    "@capacitor/cli": "^7.4.2",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
EOF

# Next.js config for mobile build with staging backend
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
  },
  experimental: {
    appDir: true
  }
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
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/contexts/*": ["./contexts/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Tailwind config
cat > "$BUILD_DIR/tailwind.config.js" << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# PostCSS config
cat > "$BUILD_DIR/postcss.config.mjs" << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
EOF

# Mobile-specific environment variables
cat > "$BUILD_DIR/.env.local" << 'EOF'
NEXT_PUBLIC_API_URL=https://rishi-staging.replit.app
NEXT_PUBLIC_APP_ENV=staging
MOBILE_BUILD=true
EOF

# Build the complete app
cd "$BUILD_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export MOBILE_BUILD=true

echo "🔨 Installing dependencies..."
npm install --no-fund --silent

echo "🔨 Building complete mobile platform..."
npm run build

echo "📱 Adding Capacitor framework..."

# Initialize Capacitor with staging config
npx cap init "Rishi Platform Staging" "com.rishi.platform.staging" --web-dir=out

# Create Capacitor config for staging with full platform support
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
      'https://*.replit.app',
      'https://*.replit.dev'
    ]
  },
  plugins: {
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#2563eb'
    },
    Keyboard: {
      resizeOnFullScreen: true
    },
    LocalNotifications: {
      iconColor: '#2563eb'
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
PACKAGE_NAME="rishi-staging-full-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating VoltBuilder package with complete platform..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*"

# Get package size
PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ FULL STAGING MOBILE PLATFORM CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 App ID: com.rishi.platform.staging"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "🎯 Features:"
echo "   ✅ Complete Rishi Platform UI"
echo "   ✅ Full component library"
echo "   ✅ Native mobile app wrapper"
echo "   ✅ Staging backend integration"
echo "   ✅ Authentic platform experience"
echo "   ✅ No compromises on interface"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload to VoltBuilder"
echo "   2. Configure project settings"
echo "   3. Compile native binaries"
echo "   4. Test full platform on device"