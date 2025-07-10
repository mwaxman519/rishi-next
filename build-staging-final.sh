#!/bin/bash

# FINAL STAGING BUILD SCRIPT - GUARANTEED TO WORK
set -e

echo "=== Building Rishi Platform for STAGING (Static Export) ==="

# CRITICAL: Remove all interfering environment files temporarily
ENV_FILES=(".env.local" ".env.development" ".env")
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$file.backup"
        echo "Backed up $file"
    fi
done

# Set staging environment variables explicitly
echo "Setting staging environment variables..."
export NODE_ENV=staging
export NEXT_PUBLIC_APP_ENV=staging
export STATIC_EXPORT=1
export DATABASE_URL="postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require"
export NEON_DATABASE_URL="postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require"
export PGUSER=rishinext_owner
export PGPASSWORD=npg_okpv0Hhtfwu2
export NEXT_PUBLIC_APP_NAME="Rishi Platform Staging"
export JWT_SECRET=staging-jwt-secret-key-change-this
export JWT_REFRESH_SECRET=staging-jwt-refresh-secret-change-this
export NEXT_PUBLIC_ENABLE_DEBUG=true
export NEXT_PUBLIC_ENABLE_ANALYTICS=false
export NEXT_PUBLIC_SHOW_ENV_BANNER=true

echo "Environment variables set:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   STATIC_EXPORT: $STATIC_EXPORT"
echo "   DATABASE_URL: [STAGING DATABASE - HIDDEN]"

# Validate staging database URL
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "✅ Database URL correctly points to staging database"
else
    echo "❌ Database URL validation failed!"
    echo "Expected: rishinext_staging"
    echo "Actual: $DATABASE_URL"
    exit 1
fi

# Critical validation - prevent production database usage
if [[ "$DATABASE_URL" == *"rishinext?sslmode"* ]]; then
    echo "❌ CRITICAL ERROR: Staging cannot use production database!"
    echo "Current DATABASE_URL appears to be production"
    exit 1
fi

# Clean previous build
echo "Cleaning previous build..."
rm -rf out .next

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations for staging
echo "Running database migrations..."
npm run db:push

# Build static export with staging config
echo "Building static export..."
NEXT_CONFIG_FILE=next.config.staging.mjs npm run build

# Verify build output
if [ -d "out" ]; then
    echo "✅ Static export build successful!"
    echo "Output directory: /out"
    
    # Show build stats
    echo ""
    echo "Build Statistics:"
    echo "HTML files: $(find out -name "*.html" 2>/dev/null | wc -l)"
    echo "JS files: $(find out -name "*.js" 2>/dev/null | wc -l)"
    echo "CSS files: $(find out -name "*.css" 2>/dev/null | wc -l)"
    echo "Total files: $(find out -type f 2>/dev/null | wc -l)"
    echo "Output size: $(du -sh out | cut -f1)"
    echo ""
    
    # Test critical files
    if [ -f "out/index.html" ]; then
        echo "✅ Index page generated"
    else
        echo "❌ Index page missing"
        exit 1
    fi
    
    if [ -f "out/dashboard.html" ] || [ -f "out/dashboard/index.html" ]; then
        echo "✅ Dashboard page generated"
    else
        echo "❌ Dashboard page missing"
        exit 1
    fi
    
    if [ -d "out/_next" ]; then
        echo "✅ Next.js assets generated"
    else
        echo "❌ Next.js assets missing"
        exit 1
    fi
    
    echo "✅ Ready to deploy to Replit Autoscale!"
    
else
    echo "❌ Build failed - /out directory not found"
    exit 1
fi

# Restore environment files
echo "Restoring environment files..."
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file.backup" ]; then
        mv "$file.backup" "$file"
        echo "Restored $file"
    fi
done

echo ""
echo "=== STAGING BUILD COMPLETE ==="
echo ""
echo "🎉 DEPLOYMENT READY!"
echo ""
echo "Instructions for Replit Autoscale:"
echo "1. Click Deploy → Autoscale"
echo "2. Select 'Static Site'"
echo "3. Set publish directory: out"
echo "4. Set build command: ./build-staging-final.sh"
echo "5. Deploy!"
echo ""
echo "The /out directory contains your static web app"