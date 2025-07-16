#!/bin/bash

# Staging Build Test Script
# Tests the Next.js build process with staging environment variables

echo "🚀 Testing staging build configuration..."
echo

# Set staging environment variables
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
unset AZURE_STATIC_WEB_APPS_API_TOKEN

echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "AZURE_STATIC_WEB_APPS_API_TOKEN: ${AZURE_STATIC_WEB_APPS_API_TOKEN:-undefined}"
echo

# Test the build (with timeout to prevent hanging)
echo "Starting build test..."
timeout 180 npm run build

echo
echo "Build test completed"