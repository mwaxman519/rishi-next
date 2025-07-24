#!/bin/bash

# Production Build Script - No Database Dependencies
echo "🏗️ Building Rishi Platform for Production Deployment"

# Set environment
export NODE_ENV=production
export STATIC_EXPORT=1

# Clean previous build
rm -rf .next out

# Install dependencies
npm install

# Skip database migrations for static export
echo "⚠️ Skipping database migrations for static export build"

# Build application
npm run build

if [ -d "out" ]; then
    echo "✅ Build successful - static export ready for deployment"
else
    echo "❌ Build failed"
    exit 1
fi
