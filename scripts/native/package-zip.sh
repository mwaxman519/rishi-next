#!/bin/bash
set -euo pipefail

BUILD_ENV=${1:-staging}

echo "📦 Starting packaging for $BUILD_ENV environment..."

# Validate BUILD_ENV
if [[ "$BUILD_ENV" != "staging" && "$BUILD_ENV" != "prod" ]]; then
  echo "❌ Invalid BUILD_ENV. Must be 'staging' or 'prod'"
  exit 1
fi

# Ensure out/ directory exists
if [ ! -d out ]; then
  echo "❌ 'out' directory not found! Run export-static.sh first."
  exit 1
fi

# Ensure release directory exists
mkdir -p release

# Run Capacitor copy to sync static files to native platforms
echo "🔄 Copying static files to native platforms..."
npx cap copy

# Verify required files exist
REQUIRED_FILES=("android" "ios" "out" "capacitor.config.ts" "voltbuilder.json" "package.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -e "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
  echo "❌ Missing required files/directories:"
  printf '%s\n' "${MISSING_FILES[@]}"
  exit 1
fi

# Create the zip file
ZIP_FILE="release/rishi-capacitor-$BUILD_ENV.zip"

echo "📁 Creating zip file: $ZIP_FILE"

# Remove existing zip if it exists
rm -f "$ZIP_FILE"

# Create zip with required files and directories
zip -r "$ZIP_FILE" \
  android/ \
  ios/ \
  out/ \
  capacitor.config.ts \
  voltbuilder.json \
  package.json \
  package-lock.json \
  node_modules/@capacitor/ \
  -x "*.git*" \
  -x "*node_modules/.cache*" \
  -x "*.DS_Store*" \
  -x "*__pycache__*" \
  -x "*.log" \
  -x "*build/intermediates*" \
  -x "*build/tmp*" \
  -x "android/.gradle*" \
  -x "android/app/build/intermediates*" \
  -x "android/app/build/tmp*"

# Verify zip was created
if [ ! -f "$ZIP_FILE" ]; then
  echo "❌ Failed to create zip file!"
  exit 1
fi

# Show zip contents summary
echo "✅ Package created successfully!"
echo "📊 Zip file size: $(du -h "$ZIP_FILE" | cut -f1)"
echo "📄 Zip contents:"
unzip -l "$ZIP_FILE" | head -20
if [ $(unzip -l "$ZIP_FILE" | wc -l) -gt 25 ]; then
  echo "... (showing first 20 items)"
fi
echo ""
echo "🎯 Ready for VoltBuilder upload: $ZIP_FILE"