#!/usr/bin/env bash
set -euo pipefail

BUILD_ENV="${1:-staging}"

echo "📦 Packaging zip for $BUILD_ENV environment..."

# Ensure out/ directory exists
if [ ! -d "out" ]; then
  echo "❌ No out/ directory found. Run export-static.sh first."
  exit 1
fi

# Copy files to Capacitor platforms
echo "🔧 Copying files to Capacitor platforms..."
npx cap copy

# Create release directory
mkdir -p release

# Define zip filename
ZIP_FILE="release/rishi-capacitor-${BUILD_ENV}.zip"
rm -f "$ZIP_FILE"

echo "🗜️ Creating zip archive: $ZIP_FILE"

# Create zip with required files
zip -r "$ZIP_FILE" \
  android \
  ios \
  out \
  capacitor.config.* \
  voltbuilder.json \
  package.json \
  package-lock.json \
  node_modules/@capacitor \
  node_modules/@capacitor-* \
  >/dev/null 2>&1

# Get zip size
ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)

echo "✅ Created $ZIP_FILE (${ZIP_SIZE})"
echo "📤 Ready for VoltBuilder upload!"