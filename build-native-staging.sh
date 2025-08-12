#!/bin/bash
set -euo pipefail

echo "🏗️ Building Rishi native app for STAGING environment..."

# Load staging environment
if [ ! -f .env.native.staging ]; then
    echo "❌ .env.native.staging not found!"
    exit 1
fi

set -a  # automatically export all variables
source .env.native.staging
set +a  # turn off automatic export

# Validate build requirements
bash scripts/native/validate-build.sh

# Export static build
bash scripts/native/export-static.sh

# Generate VoltBuilder configuration
node scripts/native/gen-voltbuilder-json.mjs

# Package for VoltBuilder
bash scripts/native/package-zip.sh staging

echo ""
echo "✅ Staging build complete!"
echo "📦 Output: release/rishi-capacitor-staging.zip"