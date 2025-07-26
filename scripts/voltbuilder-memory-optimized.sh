#!/bin/bash

echo "🧠 VoltBuilder Memory-Optimized Build"
echo "Addressing development build memory issues..."
echo ""

# Get environment parameter (default to development)
ENVIRONMENT=${1:-development}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Error: Invalid environment '$ENVIRONMENT'"
    echo "✅ Valid options: development, staging, production"
    exit 1
fi

echo "📋 Environment: $ENVIRONMENT"
echo "🧠 Memory Optimization: ENABLED"
echo ""

# CRITICAL: Maximum memory optimization for VoltBuilder
export NODE_OPTIONS="--max-old-space-size=8192 --optimize-for-size --max-semi-space-size=256 --max-new-space-size=1024"
export NEXT_TELEMETRY_DISABLED=1

# Clear all caches to reduce memory pressure
echo "🧹 Clearing build caches..."
rm -rf .next/cache
rm -rf node_modules/.cache
echo ""

# Set VoltBuilder environment
export VOLTBUILDER_BUILD=true
export MOBILE_BUILD=true

echo "🔧 Memory Settings:"
echo "   Max Old Space: 8GB"
echo "   Optimize for Size: ENABLED" 
echo "   Reduced Semi Space: 256MB"
echo "   Telemetry: DISABLED"
echo ""

echo "🚀 Starting VoltBuilder build..."
./scripts/build-mobile.sh $ENVIRONMENT

echo ""
echo "✅ Memory-optimized VoltBuilder build complete!"
echo "📱 Package ready for upload to VoltBuilder"