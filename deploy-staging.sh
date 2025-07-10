#!/bin/bash

# STAGING deployment script for Rishi Platform (Replit Autoscale)
# This script handles staging deployment with proper environment validation

set -e  # Exit on any error

echo "=== Rishi Platform STAGING Deployment (Replit Autoscale) ==="

# Validate environment
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set for staging environment"
    echo "Please provide a STAGING database URL (NOT production)"
    exit 1
fi

# Critical validation - prevent production database usage
if [[ "$DATABASE_URL" == *"rishinext?sslmode"* ]]; then
    echo "CRITICAL ERROR: Staging cannot use production database!"
    echo "Current DATABASE_URL appears to be production"
    echo "Staging should use rishinext_staging database"
    exit 1
fi

# Set staging environment
export NODE_ENV=staging
export NEXT_PUBLIC_APP_ENV=staging

echo "Environment: $NODE_ENV"
echo "App Environment: $NEXT_PUBLIC_APP_ENV"
echo "Database: [STAGING DATABASE - NOT PRODUCTION]"

# Check if this is a build or start command
if [ "$1" = "build" ]; then
    echo "Running STAGING static export build process..."
    
    # Use staging Next.js config for static export
    export NEXT_CONFIG_FILE=next.config.staging.mjs
    export STATIC_EXPORT=1
    
    echo "Building static export for Replit Autoscale..."
    npm run build
    
    echo "Static export build complete - files ready in /out directory"
    
elif [ "$1" = "start" ]; then
    echo "ERROR: Static export doesn't need a start command"
    echo "For staging, use: ./deploy-staging.sh build"
    echo "Then deploy the /out directory to Replit Autoscale"
    exit 1
else
    echo "Usage: $0 build"
    echo "  build - Build static export for Replit Autoscale staging"
    echo ""
    echo "After building, deploy the /out directory to Replit Autoscale"
    exit 1
fi

echo "=== STAGING Deployment Complete ==="