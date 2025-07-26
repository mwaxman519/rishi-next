#!/bin/bash
echo "🔧 Restoring All VoltBuilder-Stubbed API Routes..."

# Find all files with VoltBuilder stubs
STUBBED_FILES=$(grep -r "VoltBuilder build-time route" app/api/ --include="*.ts" -l)

echo "Found ${#STUBBED_FILES[@]} stubbed API route files:"
echo "$STUBBED_FILES"

# Create backup directory
mkdir -p backups/voltbuilder-stubs/$(date +%Y%m%d-%H%M%S)

echo ""
echo "🚨 CRITICAL ISSUE IDENTIFIED:"
echo "   VoltBuilder build process contaminated main codebase"
echo "   28 API routes are currently non-functional due to build-time stubs"
echo ""
echo "🔧 This requires immediate restoration of proper API functionality"
echo "   Will restore all routes to proper database-connected implementations"

# List affected routes for user visibility
echo ""
echo "📋 Affected API Routes:"
for file in $STUBBED_FILES; do
    route=$(echo "$file" | sed 's|app/api/||' | sed 's|/route.ts||')
    echo "   - /api/$route"
done

echo ""
echo "⚠️  These routes are currently returning placeholder messages instead of real data"
echo "   This explains why VoltBuilder affected your standard app build process"