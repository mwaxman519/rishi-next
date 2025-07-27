#!/bin/bash

echo "=== ULTRA-FAST STAGING BUILD ==="
echo "Optimized for maximum build speed (not size)"

# Set ultra-fast build environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=8192"

# Clear build cache for fresh fast build
echo "🧹 Clearing build cache for fresh start..."
rm -rf .next
rm -rf node_modules/.cache

# Run the fastest possible build
echo "🚀 Starting ultra-fast staging build..."
echo "⚡ Configuration: No minification, large chunks, max parallelism"
start_time=$(date +%s)

NODE_ENV=production NEXT_PUBLIC_APP_ENV=staging NEXT_TELEMETRY_DISABLED=1 npx next build

end_time=$(date +%s)
duration=$((end_time - start_time))

echo "✅ Ultra-fast staging build completed in ${duration} seconds"

# Build size report
if [ -d ".next" ]; then
    build_size=$(du -sh .next | cut -f1)
    echo "📦 Build size: ${build_size}"
fi

echo "=== STAGING BUILD READY FOR REPLIT AUTOSCALE DEPLOYMENT ==="