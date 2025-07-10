#!/bin/bash

# Quick test to verify staging configuration
echo "=== Testing Staging Configuration ==="

# Load staging environment
set -a
source .env.staging
set +a

echo "✅ Environment loaded successfully"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   STATIC_EXPORT: $STATIC_EXPORT"

# Test database URL
echo "   DATABASE_URL: $DATABASE_URL"
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "✅ Database URL correctly points to staging database"
elif [[ "$DATABASE_URL" == *"rishinext"* ]] && [[ "$DATABASE_URL" != *"rishinext_staging"* ]]; then
    echo "❌ Database URL points to production database - should be rishinext_staging"
    exit 1
else
    echo "✅ Database URL validation passed"
fi

# Test Next.js config
if [ -f "next.config.staging.mjs" ]; then
    echo "✅ Staging Next.js config exists"
else
    echo "❌ Missing next.config.staging.mjs"
    exit 1
fi

# Test build script
if [ -f "build-staging.sh" ] && [ -x "build-staging.sh" ]; then
    echo "✅ Build script exists and is executable"
else
    echo "❌ Build script missing or not executable"
    exit 1
fi

echo ""
echo "✅ All staging configuration tests passed!"
echo "Ready for Replit Autoscale deployment as static web app"