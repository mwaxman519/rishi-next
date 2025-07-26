#!/bin/bash
echo "🚀 Creating Fast Staging VoltBuilder Package (using existing build)..."

# Kill any existing builds
pkill -f "next build" || true
sleep 2

# Check if we have a recent staging build
if [ -d "out" ] && [ "$(find out -name "*.html" 2>/dev/null | wc -l)" -gt 5 ]; then
    echo "✅ Using existing build output"
else
    echo "🏗️  Creating minimal build..."
    
    # Set staging environment
    export NODE_ENV=production
    export NEXT_PUBLIC_APP_ENV=staging
    export MOBILE_BUILD=true
    export VOLTBUILDER_BUILD=true
    
    # Create minimal staging env
    cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
MOBILE_BUILD=true
VOLTBUILDER_BUILD=true
DATABASE_URL="sqlite::memory:"
EOF
    
    # Build with timeout
    timeout 300 npm run build || {
        echo "⚠️  Build timeout, using emergency static files..."
        
        # Create minimal static export
        mkdir -p out
        cat > out/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Rishi Platform Staging</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; padding-top: 50px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Rishi Platform Staging</h1>
        <p>Connecting to staging server...</p>
        <script>
            // Redirect to staging server
            setTimeout(() => {
                window.location.href = 'https://rishi-staging.replit.app';
            }, 2000);
        </script>
    </div>
</body>
</html>
EOF
        
        # Create basic assets
        mkdir -p out/_next/static
        echo "/* Minimal CSS */" > out/_next/static/app.css
    }
fi

# Configure Capacitor for staging
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
      backgroundColor: '#1a365d'
    }
  }
};

export default config;
EOF

echo "⚡ Syncing with Capacitor..."
npx cap sync --no-build

# Create VoltBuilder package
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
PACKAGE_NAME="rishi-voltbuilder-staging-${TIMESTAMP}"
mkdir -p "builds/staging"

echo "📦 Creating VoltBuilder package..."
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
  -x "*.log" \
  -q

PACKAGE_SIZE=$(du -h "builds/staging/${PACKAGE_NAME}.zip" | cut -f1)

echo ""
echo "✅ Staging VoltBuilder package created!"
echo "📱 Package: builds/staging/${PACKAGE_NAME}.zip"
echo "📏 Size: ${PACKAGE_SIZE}"
echo "🎯 Environment: Staging"
echo "🔗 Backend: https://rishi-staging.replit.app"
echo "🏷️  App ID: com.rishi.platform.staging"
echo ""
echo "🚀 Upload to VoltBuilder for native compilation!"

# List the file for confirmation
ls -la "builds/staging/${PACKAGE_NAME}.zip"