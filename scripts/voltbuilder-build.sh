#!/bin/bash

echo "🚀 VoltBuilder Build Script with Memory Optimization"
echo ""

# Set VoltBuilder environment variables
export NODE_ENV=production
export VOLTBUILDER_BUILD=true
export NODE_OPTIONS='--max-old-space-size=8192 --optimize-for-size'
export DATABASE_URL="sqlite::memory:"

echo "Environment Variables:"
echo "  NODE_ENV: $NODE_ENV"
echo "  VOLTBUILDER_BUILD: $VOLTBUILDER_BUILD"
echo "  NODE_OPTIONS: $NODE_OPTIONS"
echo "  DATABASE_URL: $DATABASE_URL"
echo ""

echo "🔧 Running Next.js build with increased heap memory..."
exec next build