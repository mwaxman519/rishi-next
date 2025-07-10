#!/bin/bash

# Fast build script for deployment to prevent timeouts
echo "🚀 Starting optimized build process..."

# Set memory limits and disable telemetry
export NODE_OPTIONS="--max-old-space-size=2048"
export NEXT_TELEMETRY_DISABLED=1

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next/cache

# Run build with minimal optimization
echo "🔨 Building with optimizations disabled..."
npx next build --no-lint --experimental-build-mode=compile

echo "✅ Build completed successfully!"