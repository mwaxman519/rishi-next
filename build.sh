#!/bin/bash

# Build script for Rishi Platform
# Handles production build with proper error handling

set -e  # Exit on any error

echo "Building Rishi Platform..."

# Environment setup
export NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm ci

# Database migration
echo "Running database migrations..."
if npm run db:push; then
    echo "Database migrations completed"
else
    echo "Database migrations failed, continuing with build..."
fi

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully"