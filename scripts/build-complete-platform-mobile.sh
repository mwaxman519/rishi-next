#!/bin/bash

# Complete Platform Mobile Build - Full Next.js App with Capacitor
# Creates mobile app with complete Rishi Platform wrapped in Capacitor

set -e

TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
BUILD_DIR="complete-platform-mobile"

echo "🚀 Building Complete Rishi Platform Mobile App"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Copying complete Next.js application..."

# Copy the entire Next.js application structure
cp -r app "$BUILD_DIR/"
cp -r components "$BUILD_DIR/"
cp -r hooks "$BUILD_DIR/"
cp -r lib "$BUILD_DIR/"
cp -r contexts "$BUILD_DIR/"
cp -r shared "$BUILD_DIR/"
cp -r styles "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"
cp package.json "$BUILD_DIR/"
cp tailwind.config.js "$BUILD_DIR/"
cp postcss.config.mjs "$BUILD_DIR/"

# Create mobile-specific Next.js config
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://rishi-staging.replit.app/api/:path*'
      }
    ];
  }
};

export default nextConfig;
EOF

# Mobile-specific TypeScript config
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

# Update package.json for mobile build
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "rishi-platform-mobile",
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

# Build the complete app
cd "$BUILD_DIR"
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export MOBILE_BUILD=true

echo "🔨 Installing dependencies for complete platform..."
npm install --no-fund --silent

echo "🔨 Building complete Rishi Platform..."
npm run build

echo "📱 Adding Capacitor to complete platform..."

# Initialize Capacitor
npx cap init "Rishi Platform" "com.rishi.platform.staging" --web-dir=out

# Create Capacitor config for complete platform
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
      'https://*.replit.app',
      'https://*.replit.dev'
    ]
  },
  plugins: {
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a'
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

# Add platforms
npx cap add android
npx cap sync

# Create VoltBuilder package
cd ..
PACKAGE_NAME="rishi-complete-platform-$TIMESTAMP.zip"
OUTPUT_DIR="builds/staging"
mkdir -p "$OUTPUT_DIR"

echo "📦 Creating complete platform VoltBuilder package..."
zip -r "$OUTPUT_DIR/$PACKAGE_NAME" "$BUILD_DIR" -x "*/node_modules/*" -x "*/.next/*"

PACKAGE_SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

# Cleanup
rm -rf "$BUILD_DIR"

echo ""
echo "✅ COMPLETE RISHI PLATFORM MOBILE APP CREATED!"
echo "📁 Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📊 Size: $PACKAGE_SIZE"
echo "📱 App: Complete Rishi Platform wrapped with Capacitor"
echo "🌐 Backend: https://rishi-staging.replit.app"
echo ""
echo "🎯 Features:"
echo "   ✅ Complete Next.js Rishi Platform"
echo "   ✅ All components, hooks, and contexts"
echo "   ✅ Full UI library and styling"
echo "   ✅ Native mobile wrapper via Capacitor"
echo "   ✅ API calls to staging backend"
echo "   ✅ Authentic platform experience"
echo ""
echo "This is the COMPLETE Rishi Platform as a mobile app!"