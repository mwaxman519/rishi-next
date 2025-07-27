#!/bin/bash
echo "🚀 Ultra-fast staging deployment preparation..."

# Clean build directory
echo "🧹 Cleaning build cache..."
rm -rf .next/

# Set staging environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size"

echo "📦 Building optimized staging bundle..."
npm run build

echo "📊 Build size analysis:"
du -sh .next/
echo "Files: $(find .next/ -type f | wc -l)"

echo "✅ Staging deployment package ready!"
