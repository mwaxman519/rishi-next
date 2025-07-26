#!/bin/bash

echo "🚀 Autoscale Staging Build (No VoltBuilder detection)"
echo ""

# Clear all mobile/VoltBuilder environment variables
unset VOLTBUILDER_BUILD
unset MOBILE_BUILD

# Set clean staging environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging

# Don't use .env.production (contains VOLTBUILDER_BUILD=true)
echo "Environment: Staging deployment (server mode)"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "VoltBuilder detection: DISABLED"
echo ""

# Run build with staging environment only
echo "🔧 Building for Autoscale with server mode..."
npx next build