#!/bin/bash

echo "=== DEBUGGING ENVIRONMENT LOADING ==="

# Check all environment files
echo "1. Environment files present:"
ls -la .env* 2>/dev/null || echo "No .env files found"

echo ""
echo "2. Current environment before any loading:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   NODE_ENV: $NODE_ENV"

echo ""
echo "3. Loading staging environment step by step:"

# Load .env.staging manually
echo "   Loading .env.staging..."
while IFS= read -r line; do
    if [[ "$line" =~ ^[^#]*= ]]; then
        export "$line"
        echo "      Exported: $line"
    fi
done < .env.staging

echo ""
echo "4. After loading .env.staging:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   NODE_ENV: $NODE_ENV"

echo ""
echo "5. Testing if DATABASE_URL contains staging:"
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "   ✅ Database URL contains staging"
else
    echo "   ❌ Database URL does NOT contain staging"
fi

echo ""
echo "6. Manual override test:"
export DATABASE_URL="postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require"
echo "   Manually set DATABASE_URL: $DATABASE_URL"
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "   ✅ Manual override works"
else
    echo "   ❌ Manual override failed"
fi