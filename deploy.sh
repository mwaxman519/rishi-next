#!/bin/bash

# Complete deployment script for Rishi Platform
# Handles both build and production startup

set -e  # Exit on any error

echo "=== Rishi Platform Deployment ==="

# Check if this is a build or start command
if [ "$1" = "build" ]; then
    echo "Running build process..."
    ./build.sh
elif [ "$1" = "start" ]; then
    echo "Starting production server..."
    ./start-prod.sh
else
    echo "Usage: $0 [build|start]"
    echo "  build - Build the application"
    echo "  start - Start the production server"
    exit 1
fi

echo "=== Deployment Complete ==="