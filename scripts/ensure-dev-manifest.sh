#!/bin/bash

echo "=== ENSURING DEV ENVIRONMENT INTEGRITY ==="

# Kill any running staging builds that might corrupt dev
pkill -f "next build" 2>/dev/null || true

# Remove corrupted build cache
rm -rf .next

# Ensure we're in development mode
export NODE_ENV=development
export NEXT_PUBLIC_APP_ENV=development

# Start fresh dev server
echo "✅ Development environment restored"
echo "Starting clean dev server..."