#!/bin/bash

echo "🚀 Preparing Rishi Platform for Mobile Deployment"

# Step 1: Clean and build
echo "📦 Building production version..."
npm run build

# Step 2: Create VoltBuilder package
echo "📱 Creating VoltBuilder package..."
./create-voltbuilder-package.sh

# Step 3: Verify package contents
echo "🔍 Verifying package contents..."
PACKAGE_NAME="rishi-platform-$(date +%Y-%m-%d).zip"
if [ -f "$PACKAGE_NAME" ]; then
    echo "✅ Package created: $PACKAGE_NAME"
    echo "📊 Package size: $(du -h "$PACKAGE_NAME" | cut -f1)"
    echo "📋 Contents preview:"
    unzip -l "$PACKAGE_NAME" | head -20
else
    echo "❌ Package creation failed"
    exit 1
fi

# Step 4: Deployment instructions
echo ""
echo "🎯 Next Steps for Mobile Deployment:"
echo "1. Go to https://voltbuilder.com/"
echo "2. Sign up for free trial (no credit card needed)"
echo "3. Upload: $PACKAGE_NAME"
echo "4. Build platforms: Android APK + iOS IPA"
echo "5. Distribute via Firebase App Distribution"
echo ""
echo "📚 Full guide: See MOBILE_APP_DEPLOYMENT_GUIDE.md"
echo ""
echo "✅ Your Rishi Platform mobile apps are ready for deployment!"