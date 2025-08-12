#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing static export build..."

# Load staging environment variables
export NEXT_PUBLIC_API_BASE_URL=https://rishi-staging.replit.app
export NATIVE_APP_NAME="Rishi Platform Staging"
export NATIVE_IOS_BUNDLE_ID=co.rishi.app.staging
export NATIVE_ANDROID_APP_ID=co.rishi.app.staging
export NATIVE_CHANNEL=staging

echo "Environment loaded:"
echo "  API Base: ${NEXT_PUBLIC_API_BASE_URL}"
echo "  App Name: ${NATIVE_APP_NAME}"

# Test the static export process
bash scripts/native/export-static.sh

# Check output
if [ -d "out" ]; then
  echo "✅ Static export successful"
  echo "📁 Files in out/:"
  ls -la out/ | head -10
else
  echo "❌ Static export failed"
  exit 1
fi