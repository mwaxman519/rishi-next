#!/bin/bash
# Staging Deployment Script with Database Schema
# This script ensures database schema is deployed as part of the deployment process

set -e

echo "Starting staging deployment..."

# Check environment
if [ "$NODE_ENV" != "production" ] && [ "$NODE_ENV" != "staging" ]; then
    echo "Setting NODE_ENV to staging for deployment"
    export NODE_ENV=staging
fi

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not found. Database connection required."
    exit 1
fi

echo "Environment: $NODE_ENV"
echo "Database URL configured: YES"

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Deploy database schema
echo "Deploying database schema..."
node scripts/deploy-db-schema.js

# Build application
echo "Building application..."
npm run build

# Test database connection
echo "Testing database connection..."
node -e "
const { db } = require('./server/db.ts');
async function test() {
  try {
    const result = await db.execute('SELECT 1 as test');
    console.log('Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}
test();
"

echo "Staging deployment completed successfully!"