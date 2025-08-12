#!/bin/bash
set -euo pipefail

echo "🧪 Testing native build system..."

# Test validation script
echo "1️⃣ Testing build validation..."
bash scripts/native/validate-build.sh

# Test that we can source environment files
echo "2️⃣ Testing environment files..."
if [ -f .env.native.staging ]; then
    source .env.native.staging
    echo "✅ Staging environment loaded: $NATIVE_APP_NAME"
else
    echo "❌ .env.native.staging missing"
    exit 1
fi

if [ -f .env.native.prod ]; then
    source .env.native.prod  
    echo "✅ Production environment loaded: $NATIVE_APP_NAME"
else
    echo "❌ .env.native.prod missing"
    exit 1
fi

# Test VoltBuilder config generation
echo "3️⃣ Testing VoltBuilder config generation..."
set -a  # automatically export all variables
source .env.native.staging
set +a  # turn off automatic export
node scripts/native/gen-voltbuilder-json.mjs

if [ -f voltbuilder.json ]; then
    echo "✅ VoltBuilder config generated successfully"
    echo "📋 Config summary:"
    echo "   App Name: $(jq -r '.title' voltbuilder.json)"
    echo "   App ID: $(jq -r '.id' voltbuilder.json)"
    echo "   Version: $(jq -r '.version' voltbuilder.json)"
else
    echo "❌ VoltBuilder config generation failed"
    exit 1
fi

# Clean up test files
rm -f voltbuilder.json

echo ""
echo "✅ All native build system tests passed!"
echo ""
echo "Ready to build:"
echo "  Staging: bash build-native-staging.sh"
echo "  Production: bash build-native-prod.sh"