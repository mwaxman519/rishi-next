#!/bin/bash
set -euo pipefail

echo "🚀 Starting static export for native build..."

# Back up the original next.config.mjs
if [ -f next.config.mjs ]; then
  cp next.config.mjs next.config.mjs.bak
  echo "✅ Backed up next.config.mjs"
fi

# Copy static configuration
if [ ! -f next.config.static.mjs ]; then
  echo "❌ next.config.static.mjs not found!"
  exit 1
fi

cp next.config.static.mjs next.config.mjs
echo "✅ Switched to static Next.js configuration"

# Temporarily disable API routes for export
if [ -d app/api ]; then
  mv app/api app/api.__disabled_for_export__
  echo "✅ Temporarily disabled API routes for static export"
fi

# Clean previous builds
rm -rf .next out
echo "✅ Cleaned previous builds"

# Build the static application
echo "📦 Building static Next.js app..."
npx next build

# Restore API routes
if [ -d app/api.__disabled_for_export__ ]; then
  mv app/api.__disabled_for_export__ app/api
  echo "✅ Restored API routes"
fi

# Restore original configuration
if [ -f next.config.mjs.bak ]; then
  mv next.config.mjs.bak next.config.mjs
  echo "✅ Restored original next.config.mjs"
fi

# Verify out directory exists
if [ ! -d out ]; then
  echo "❌ Static export failed - 'out' directory not found!"
  exit 1
fi

echo "✅ Static export completed successfully"
echo "📁 Output directory: $(pwd)/out"