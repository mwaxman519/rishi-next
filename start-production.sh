#!/bin/bash

# PRODUCTION startup script for Rishi Platform
# This script handles TRUE production deployment startup

set -e  # Exit on any error

echo "Starting Rishi Platform in PRODUCTION mode..."

# Environment validation
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set for production environment"
    exit 1
fi

# Validate we're using production database
if [[ "$DATABASE_URL" != *"production"* ]]; then
    echo "WARNING: Production should use production database"
fi

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production
export PORT=${PORT:-5000}
export HOST=${HOST:-0.0.0.0}

echo "Environment: $NODE_ENV"
echo "App Environment: $NEXT_PUBLIC_APP_ENV"
echo "Port: $PORT"
echo "Host: $HOST"

# Database setup
echo "Setting up production database..."
if npm run db:push; then
    echo "Database setup completed successfully"
else
    echo "Database setup failed"
    exit 1
fi

# Start the application
echo "Starting production server on $HOST:$PORT..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Verify build exists
if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found. Please run build first."
    exit 1
fi

# Start with proper error handling
if npx next start -p $PORT -H $HOST; then
    echo "Production application started successfully"
else
    echo "ERROR: Failed to start production application"
    exit 1
fi