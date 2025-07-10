#!/bin/bash

# PRODUCTION deployment script for Rishi Platform
# This script handles true production deployment

set -e  # Exit on any error

echo "=== Rishi Platform PRODUCTION Deployment ==="

# Validate environment
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set for production environment"
    exit 1
fi

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production

echo "Environment: $NODE_ENV"
echo "App Environment: $NEXT_PUBLIC_APP_ENV"
echo "Database: [PRODUCTION DATABASE]"

# Check if this is a build or start command
if [ "$1" = "build" ]; then
    echo "Running PRODUCTION build process..."
    ./build.sh
elif [ "$1" = "start" ]; then
    echo "Starting PRODUCTION server..."
    ./start-production.sh
else
    echo "Usage: $0 [build|start]"
    echo "  build - Build the application for production"
    echo "  start - Start the production server"
    exit 1
fi

echo "=== PRODUCTION Deployment Complete ==="