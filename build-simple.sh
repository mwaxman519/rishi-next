#!/bin/bash

# Simple build script for testing
echo "🔧 Testing simplified build process..."

# Set environment for faster builds
export NODE_ENV=production
export STATIC_EXPORT=1
export NEXT_TELEMETRY_DISABLED=1

# Clear any existing builds
rm -rf .next
rm -rf out

# Run simplified build
echo "Starting Next.js build..."
timeout 60 npx next build

echo "Build test completed."