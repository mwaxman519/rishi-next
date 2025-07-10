#!/bin/bash

# Pre-commit hook to catch build issues before they reach the repository

echo "🔍 Running pre-commit build validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if we should prevent commit
PREVENT_COMMIT=false

# 1. Run TypeScript check
echo "📋 Checking TypeScript..."
if npx tsc --noEmit --quiet; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    PREVENT_COMMIT=true
fi

# 2. Run ESLint with build-specific rules
echo "📋 Checking ESLint (build rules)..."
if npx eslint app/ --ext .ts,.tsx --config .eslintrc.build.json --quiet; then
    echo -e "${GREEN}✅ ESLint check passed${NC}"
else
    echo -e "${YELLOW}⚠️ ESLint warnings found${NC}"
    # Don't prevent commit for ESLint warnings, but show them
fi

# 3. Run custom build validation
echo "📋 Running custom build validation..."
if node scripts/proactive-build-validation.js; then
    echo -e "${GREEN}✅ Build validation passed${NC}"
else
    echo -e "${RED}❌ Build validation failed${NC}"
    PREVENT_COMMIT=true
fi

# 4. Check for common patterns
echo "📋 Checking for common issues..."

# Check for async/await patterns
if grep -r "if.*hasPermission.*)" app/ --include="*.ts" --include="*.tsx" | grep -v "await"; then
    echo -e "${RED}❌ Found hasPermission() calls without await${NC}"
    PREVENT_COMMIT=true
fi

# Check for Next.js 15 async params pattern
if grep -r "params: {" app/api/ --include="*.ts" | grep -v "Promise<{"; then
    echo -e "${RED}❌ Found old Next.js params pattern (should use Promise<{...}>)${NC}"
    PREVENT_COMMIT=true
fi

# Check for relative imports that should use path aliases
if grep -r "import.*from.*'\.\./" app/ --include="*.ts" --include="*.tsx" | grep -E "(lib/auth-options|shared/)"; then
    echo -e "${YELLOW}⚠️ Found relative imports that should use path aliases${NC}"
fi

# Summary
echo ""
echo "=========================================="
if [ "$PREVENT_COMMIT" = true ]; then
    echo -e "${RED}❌ PRE-COMMIT FAILED${NC}"
    echo "Fix the issues above before committing."
    echo "Run 'npm run build:validate' for detailed analysis."
    exit 1
else
    echo -e "${GREEN}✅ PRE-COMMIT PASSED${NC}"
    echo "Code is ready for deployment!"
    exit 0
fi