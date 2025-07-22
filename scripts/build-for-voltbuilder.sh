#!/bin/bash

echo "🏗️ Building Rishi Platform for VoltBuilder mobile deployment..."

# Set production environment variables for build
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production
export NEXT_PHASE=phase-production-build

echo "Environment variables set for production build:"
echo "NODE_ENV=$NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV" 
echo "NEXT_PHASE=$NEXT_PHASE"

# Verify database connection is available
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set. Cannot build for production."
  echo "Please set your production database URL:"
  echo "export DATABASE_URL='your-production-database-url'"
  exit 1
fi

echo "✅ DATABASE_URL configured (${DATABASE_URL:0:30}...)"

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