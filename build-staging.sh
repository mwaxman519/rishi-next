#!/bin/bash

# STAGING Static Export Build Script for Replit Autoscale
# This script builds the application as a static export for staging deployment

set -e  # Exit on any error

echo "=== Building Rishi Platform for STAGING (Static Export) ==="

# Load staging environment
if [ -f ".env.staging" ]; then
    echo "Loading staging environment variables..."
    set -a  # Automatically export variables
    source .env.staging
    set +a  # Stop automatically exporting
else
    echo "ERROR: .env.staging file not found"
    exit 1
fi

# Validate staging environment
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set for staging environment"
    exit 1
fi

# Critical validation - prevent production database usage
if [[ "$DATABASE_URL" == *"rishinext?sslmode"* ]]; then
    echo "CRITICAL ERROR: Staging cannot use production database!"
    echo "Current DATABASE_URL appears to be production"
    echo "Staging should use rishinext_staging database"
    exit 1
fi

# Set environment for static export
export NODE_ENV=staging
export NEXT_PUBLIC_APP_ENV=staging
export STATIC_EXPORT=1

# Use staging Next.js config
export NEXT_CONFIG_FILE=next.config.staging.mjs

echo "Environment: $NODE_ENV"
echo "App Environment: $NEXT_PUBLIC_APP_ENV"
echo "Database: [STAGING DATABASE - NOT PRODUCTION]"
echo "Build Type: Static Export"

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
    
    # Show some build stats
    echo ""
    echo "Build Statistics:"
    echo "HTML files: $(find out -name "*.html" | wc -l)"
    echo "JS files: $(find out -name "*.js" | wc -l)"
    echo "CSS files: $(find out -name "*.css" | wc -l)"
    echo "Total files: $(find out -type f | wc -l)"
    echo ""
    echo "Ready to deploy to Replit Autoscale!"
else
    echo "❌ Build failed - /out directory not found"
    exit 1
fi

echo "=== STAGING Build Complete ==="