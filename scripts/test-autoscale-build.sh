#!/bin/bash

echo "🧪 Testing Autoscale Build Configuration..."
echo ""

# Clear any VoltBuilder environment variables
unset VOLTBUILDER_BUILD
unset MOBILE_BUILD

# Set staging environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging

echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "VOLTBUILDER_BUILD: '$VOLTBUILDER_BUILD'"
echo "MOBILE_BUILD: '$MOBILE_BUILD'"
echo "REPLIT: '$REPLIT'"
echo ""

echo "🔧 Running Next.js build for Autoscale..."
npm run build