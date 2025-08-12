#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Starting static export for native build..."

# Backup current next config
if [ -f "next.config.mjs" ]; then
  cp next.config.mjs next.config.mjs.bak
  echo "✅ Backed up next.config.mjs"
fi

# Use static config for export
cp next.config.static.mjs next.config.mjs
echo "✅ Switched to static config"

# API routes are excluded via Next.js config - no need to move files
echo "✅ API routes will be excluded via Next.js config"

# Clean previous builds
rm -rf out .next
echo "✅ Cleaned previous builds"

# Build static export
echo "🏗️ Building static export..."
npx next build

# Check if export was successful
if [ ! -d "out" ]; then
  echo "❌ No out/ directory produced. Export blockers present."
  exit 1
fi
echo "✅ Static export completed successfully"

# Restore original config and API routes
if [ -f "next.config.mjs.bak" ]; then
  mv next.config.mjs.bak next.config.mjs
  echo "✅ Restored original next.config.mjs"
fi

# API routes were not moved - no restoration needed
echo "✅ API routes remain in place"

echo "🎉 Static export ready in ./out/"