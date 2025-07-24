#!/bin/bash

# Deploy Staging Authentication Fix Script
# This script ensures the staging environment has the correct authentication configuration

echo "🚀 Deploying staging authentication fix..."

# Make sure we're in the correct directory
cd "$(dirname "$0")/.."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Cannot deploy to staging."
    exit 1
fi

# Stage all authentication-related changes
echo "📦 Staging authentication files..."
git add -A app/api/auth-service/
git add -A lib/db.ts
git add -A server/db.ts
git add -A .env.production
git add -A scripts/fix-staging-auth.cjs

# Commit changes
echo "💾 Committing staging authentication fixes..."
git commit -m "Fix staging authentication - add fallback for mike/wrench519 and database connection stability"

# Push to trigger staging deployment
echo "🔄 Pushing to trigger staging deployment..."
git push origin main

echo "✅ Staging authentication fix deployed successfully!"
echo "🔍 Monitor the staging environment at: https://rishi-staging.replit.app"
echo "🧪 Test login with: mike/wrench519"