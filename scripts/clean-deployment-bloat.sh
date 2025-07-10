#!/bin/bash

echo "=== CLEANING DEPLOYMENT BLOAT ==="
echo "Removing duplicate folders and build artifacts..."

# Removed duplicate app structures (completed)
# - manual-deploy/ ✅
# - complete-deployment/ ✅ 
# - temp-production/ ✅

# Removed build artifacts (completed)
# - .vercel/ ✅
rm -rf out/
rm -rf build-errors/
rm -rf optimization/

# Remove debug folders from main app
rm -rf app/docs-debug/
rm -rf app/debug/
rm -rf app/google-maps-debug/
rm -rf app/env-debug/
rm -rf app/tests/
rm -rf app/test/
rm -rf app/api-test/
rm -rf app/api/debug/
rm -rf app/api/test/
rm -rf app/api/auth-service-test/
rm -rf app/api/db-test/

# Remove backup files
find . -name "*.backup" -type f -delete
find . -name "*.bak" -type f -delete
find . -name "temp.txt" -type f -delete

# Remove test scripts (keep core build scripts)
rm -f scripts/test-*.js
rm -f scripts/test-*.mjs
rm -f test-*.sh
rm -f test-*.js

# Clean up config backups
rm -f next.config.backup
rm -f package.json.backup
rm -f user-backup.json

echo "=== CLEANUP COMPLETE ==="
echo "Checking file count after cleanup..."
echo "TypeScript files: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)"
echo "Total project files: $(find . -type f | grep -v node_modules | wc -l)"