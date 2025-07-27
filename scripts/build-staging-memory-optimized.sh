#!/bin/bash

# Memory-optimized staging build script for Replit Autoscale deployment
# Addresses JavaScript heap out of memory issues

set -e

echo "🚀 Starting memory-optimized staging build..."

# Set NODE_OPTIONS for increased heap size
export NODE_OPTIONS="--max-old-space-size=2048 --max-semi-space-size=128 --optimize-for-size"

# Set staging environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging

# Enable garbage collection optimizations
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc --max-old-space-size=2048"

echo "📊 Memory configuration:"
echo "  - Max heap size: 2048MB"
echo "  - Semi-space size: 128MB"
echo "  - Garbage collection: optimized"
echo "  - Environment: staging"

# Verify environment variables
echo "🔍 Environment verification:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "  - NODE_OPTIONS: $NODE_OPTIONS"

# Run the build with memory monitoring
echo "🔨 Starting Next.js build..."
time npm run build

echo "✅ Memory-optimized staging build completed successfully!"
echo "💡 Health check endpoints available:"
echo "  - /api/health (standard)"
echo "  - /api/health/lightweight (ultra-fast)"
echo "  - /api/healthcheck (static)"