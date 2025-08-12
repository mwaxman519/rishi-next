#!/bin/bash
set -euo pipefail

echo "🔍 Validating native build requirements..."

# Check for service worker registration calls (should have exactly one .register call)
SW_REGISTER_COUNT=$(grep -R "serviceWorker\.register" -n app || true | wc -l)
if [ "$SW_REGISTER_COUNT" -gt 1 ]; then
  echo "❌ Multiple service worker registrations found:"
  grep -R "serviceWorker\.register" -n app
  exit 1
elif [ "$SW_REGISTER_COUNT" -eq 1 ]; then
  echo "✅ Single service worker registration confirmed"
else
  echo "ℹ️  No service worker registrations found (acceptable for static builds)"
fi

# Check for direct fetch('/api calls (these need to use apiFetch instead)
FETCH_API_COUNT=$(grep -R "fetch('/api" -n app || true | wc -l)
if [ "$FETCH_API_COUNT" != "0" ]; then
  echo "❌ Direct fetch('/api calls found in app-owned code:"
  grep -R "fetch('/api" -n app
  echo ""
  echo "These must be replaced with apiFetch('/api')"
  exit 1
fi
echo "✅ No direct fetch('/api calls found"

# Print current environment configuration
echo ""
echo "📋 Build Configuration:"
echo "🌍 API Base URL: ${NEXT_PUBLIC_API_BASE_URL:-'Not set'}"
echo "📱 App Name: ${NATIVE_APP_NAME:-'Not set'}"
echo "🤖 Android App ID: ${NATIVE_ANDROID_APP_ID:-'Not set'}"
echo "🍎 iOS Bundle ID: ${NATIVE_IOS_BUNDLE_ID:-'Not set'}"
echo "🏷️ Channel: ${NATIVE_CHANNEL:-'Not set'}"

echo ""
echo "✅ Native build validation passed"