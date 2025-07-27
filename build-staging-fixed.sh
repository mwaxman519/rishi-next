#!/bin/bash

# STAGING Static Export Build Script - FIXED VERSION
set -e

echo "=== Building Rishi Platform for STAGING (Static Export) ==="

# CRITICAL: Temporarily rename .env.local to prevent override
if [ -f ".env.local" ]; then
    mv .env.local .env.local.temp
    echo "Temporarily moved .env.local to prevent override"
fi

# Load staging environment explicitly
source ./load-staging-env.sh

echo "Environment loaded:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   DATABASE_URL: [STAGING DATABASE]"
echo "   STATIC_EXPORT: $STATIC_EXPORT"

# Validate staging database URL
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "✅ Database URL correctly points to staging database"
else
    echo "❌ Database URL validation failed"
    echo "Expected: rishinext_staging"
    echo "Actual: $DATABASE_URL"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations for staging
echo "Running database migrations..."
npm run db:push

# Build static export
echo "Building static export..."
npm run build

# Verify build output
if [ -d "out" ]; then
    echo "✅ Static export build successful!"
    echo "Output directory: /out"
    echo "Files ready for Replit Autoscale deployment"
    
    # Show build stats
    echo ""
    echo "Build Statistics:"
    echo "HTML files: $(find out -name "*.html" 2>/dev/null | wc -l)"
    echo "JS files: $(find out -name "*.js" 2>/dev/null | wc -l)"
    echo "CSS files: $(find out -name "*.css" 2>/dev/null | wc -l)"
    echo "Total files: $(find out -type f 2>/dev/null | wc -l)"
    echo ""
    echo "✅ Ready to deploy to Replit Autoscale!"
else
    echo "❌ Build failed - /out directory not found"
    exit 1
fi

# Restore .env.local if it was moved
if [ -f ".env.local.temp" ]; then
    mv .env.local.temp .env.local
    echo "Restored .env.local"
fi

echo "=== STAGING Build Complete ==="
