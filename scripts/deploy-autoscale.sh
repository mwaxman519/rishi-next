#!/bin/bash

echo "🚀 Preparing Replit Autoscale deployment..."

# Set environment variables for deployment
export REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=true
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export NEXT_TELEMETRY_DISABLED=1
export DISABLE_WEBPACK_CSS_LOADER=true
export SKIP_STYLE_LOADER=true

echo "✅ Environment variables set for Autoscale"

# Ensure style-loader is available
if [ ! -d "node_modules/style-loader" ]; then
    echo "📦 Installing style-loader dependency..."
    npm install style-loader
    echo "✅ style-loader installed"
else
    echo "✅ style-loader already available"
fi

# Use the optimized config for deployment
echo "🔧 Using optimized Next.js config for Autoscale..."
cp next.config.autoscale.mjs next.config.mjs

# Clean any cached build files
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf out

echo "🏗️ Running optimized build for Replit Autoscale..."
npm run build

echo "🎯 Autoscale deployment preparation complete!"