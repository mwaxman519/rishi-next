#!/bin/bash
echo "📱 Creating Staging VoltBuilder Package..."

# Set staging environment variables
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export MOBILE_BUILD=true
export VOLTBUILDER_BUILD=true

echo "🔧 Environment Configuration:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   MOBILE_BUILD: $MOBILE_BUILD"
echo "   VOLTBUILDER_BUILD: $VOLTBUILDER_BUILD"

# Create staging environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
MOBILE_BUILD=true
VOLTBUILDER_BUILD=true

# Staging database connection
DATABASE_URL="postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging"

# Build safety - prevents database connections during static export
VOLTBUILDER_BUILD=true

# JWT and session secrets (staging)
JWT_SECRET="staging-jwt-secret-key-2024"
SESSION_SECRET="staging-session-secret-key-2024"
EOF

# Configure Capacitor for staging environment
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.staging',
  appName: 'Rishi Platform Staging',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    url: 'https://rishi-staging.replit.app'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scheme: 'Rishi Platform Staging'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a365d',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
EOF

echo "🏗️  Building Next.js static export for mobile..."

# Build with staging configuration
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Next.js build failed"
    exit 1
fi

echo "⚡ Syncing with Capacitor..."

# Sync with Capacitor
npx cap sync

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed" 
    exit 1
fi

echo "📦 Creating VoltBuilder package..."

# Create timestamp
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")

# Create VoltBuilder package directory
PACKAGE_NAME="rishi-voltbuilder-staging-${TIMESTAMP}"
mkdir -p "builds/staging"

# Create the package
zip -r "builds/staging/${PACKAGE_NAME}.zip" \
  android/ \
  ios/ \
  out/ \
  capacitor.config.ts \
  package.json \
  voltbuilder.json \
  -x "android/app/build/*" \
  -x "android/.gradle/*" \
  -x "ios/build/*" \
  -x "*.log"

PACKAGE_SIZE=$(du -h "builds/staging/${PACKAGE_NAME}.zip" | cut -f1)

echo ""
echo "✅ Staging VoltBuilder package created successfully!"
echo "📱 Package: builds/staging/${PACKAGE_NAME}.zip"
echo "📏 Size: ${PACKAGE_SIZE}"
echo "🎯 Environment: Staging"
echo "🔗 Backend: https://rishi-staging.replit.app"
echo "🏷️  App ID: com.rishi.platform.staging"
echo ""
echo "🚀 Ready for VoltBuilder compilation!"
echo "   Upload this package to VoltBuilder for native app compilation"