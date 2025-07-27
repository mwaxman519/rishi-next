#!/bin/bash
echo "🚨 EMERGENCY STAGING DEPLOYMENT - SIZE OPTIMIZED"

# Clean everything
echo "🧹 Removing all caches and build artifacts..."
rm -rf .next/
rm -rf node_modules/.cache/
rm -rf .cache/

# Use emergency config
echo "⚡ Switching to emergency lightweight config..."
cp next.config.staging-emergency.mjs next.config.mjs

# Set environment for ultra-lightweight build
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size"

echo "📦 Building emergency lightweight package..."
npm run build

# Check build size
echo "📊 Emergency build size:"
du -sh .next/
echo "Files: $(find .next/ -type f | wc -l)"

# Restore original config
echo "🔄 Restoring original config..."
cp next.config.staging-backup.mjs next.config.mjs

echo "✅ Emergency deployment package ready - should be under 30MB!"