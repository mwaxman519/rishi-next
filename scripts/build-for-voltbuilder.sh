#!/bin/bash

echo "🏗️ Building Rishi Platform for VoltBuilder mobile deployment..."

# Load VoltBuilder-specific environment variables
if [ -f ".env.voltbuilder" ]; then
  source .env.voltbuilder
  echo "✅ Loaded VoltBuilder environment configuration"
else
  echo "⚠️ No .env.voltbuilder found, using defaults"
  export NODE_ENV=production
  export NEXT_PUBLIC_APP_ENV=production
  export NEXT_PHASE=phase-production-build
  export FORCE_ENVIRONMENT=production
fi

echo "Environment variables set for VoltBuilder build:"
echo "NODE_ENV=$NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV" 
echo "NEXT_PHASE=$NEXT_PHASE"
echo "FORCE_ENVIRONMENT=$FORCE_ENVIRONMENT"

# Verify production database connection is available
if [ -z "$PRODUCTION_DATABASE_URL" ] && [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: No production database URL configured."
  echo "Please set PRODUCTION_DATABASE_URL in .env.voltbuilder or DATABASE_URL"
  exit 1
fi

if [ -n "$PRODUCTION_DATABASE_URL" ]; then
  echo "✅ PRODUCTION_DATABASE_URL configured (${PRODUCTION_DATABASE_URL:0:30}...)"
else
  echo "✅ DATABASE_URL configured (${DATABASE_URL:0:30}...)"
fi

# Run the build
echo "Starting Next.js production build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo "🔄 Creating VoltBuilder package..."
  ./create-voltbuilder-package.sh
else
  echo "❌ Build failed. Check error messages above."
  exit 1
fi