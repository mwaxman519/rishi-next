#!/bin/bash
set -euo pipefail

echo "🏗️ Building Rishi native app for PRODUCTION environment..."

# Load production environment
if [ ! -f .env.native.prod ]; then
    echo "❌ .env.native.prod not found!"
    exit 1
fi

set -a  # automatically export all variables
source .env.native.prod
set +a  # turn off automatic export

# Validate build requirements
bash scripts/native/validate-build.sh

# Export static build
bash scripts/native/export-static.sh

# Generate VoltBuilder configuration
node scripts/native/gen-voltbuilder-json.mjs

# Package for VoltBuilder
bash scripts/native/package-zip.sh prod

echo ""
echo "✅ Production build complete!"
echo "📦 Output: release/rishi-capacitor-prod.zip"