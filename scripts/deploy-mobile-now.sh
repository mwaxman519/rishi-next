#!/bin/bash

# Deploy Mobile Now - One-click deployment for Rishi Platform
# Uses existing VoltBuilder package for immediate deployment

echo "⚡ Rishi Platform - Mobile Deployment"
echo "===================================="

PACKAGE="builds/staging/rishi-staging-fullscreen-2025-07-27-2224.zip"
PLATFORM=${1:-android}

if [ ! -f "$PACKAGE" ]; then
    echo "❌ Package not found: $PACKAGE"
    echo "🔧 Creating new package first..."
    cd builds/staging
    TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
    NEW_PACKAGE="rishi-staging-mobile-${TIMESTAMP}.zip"
    
    zip -r "$NEW_PACKAGE" \
      android/ ios/ app/ components/ lib/ shared/ styles/ public/ \
      services/ hooks/ contexts/ .next/ capacitor.config.ts \
      capacitor.config.json package.json next.config.mjs \
      .env.production tsconfig.json tailwind.config.js drizzle.config.ts \
      -x "node_modules/*" -x "*.log" -x ".git/*" >/dev/null 2>&1
    
    if [ -f "$NEW_PACKAGE" ]; then
        echo "✅ New package created: $NEW_PACKAGE"
        PACKAGE="builds/staging/$NEW_PACKAGE"
    else
        echo "❌ Failed to create package"
        exit 1
    fi
    cd ../..
fi

echo "📦 Using package: $(basename "$PACKAGE")"
echo "📱 Platform: $PLATFORM"
echo ""

# Deploy with VoltBuilder automation
node scripts/voltbuilder-complete.js quick "$PACKAGE" "$PLATFORM"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎯 DEPLOYMENT SUMMARY"
    echo "===================="
    echo "✅ Package uploaded to VoltBuilder"
    echo "🌐 Dashboard: https://voltbuilder.com/"
    echo "📱 Ready for $PLATFORM compilation"
    echo ""
    echo "💡 Complete the build manually in VoltBuilder dashboard"
    echo "   Your VoltBuilder Pro account is already configured"
else
    echo "❌ Deployment failed"
    exit 1
fi