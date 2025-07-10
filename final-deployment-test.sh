#!/bin/bash

# Final comprehensive deployment test with database URL fix

echo "=== FINAL DEPLOYMENT TEST ==="

# Step 1: Test environment isolation
echo "1. Testing environment isolation..."

# Temporarily move .env.local to prevent override
if [ -f ".env.local" ]; then
    mv .env.local .env.local.temp
    echo "   ✅ Temporarily moved .env.local"
fi

# Load staging environment
source ./load-staging-env.sh

# Test database URL
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "   ✅ Database URL correctly points to staging (rishinext_staging)"
else
    echo "   ❌ Database URL validation failed"
    echo "   Expected: rishinext_staging"
    echo "   Actual: $DATABASE_URL"
    exit 1
fi

# Step 2: Test build process
echo "2. Testing build process..."

# Clean previous build
rm -rf out .next

# Test Next.js configuration
export NEXT_CONFIG_FILE=next.config.staging.mjs
if NODE_ENV=staging STATIC_EXPORT=1 npx next build --no-lint > build.log 2>&1; then
    echo "   ✅ Build process succeeded"
    
    # Check build output
    if [ -d "out" ]; then
        echo "   ✅ Static export generated /out directory"
        
        # Check critical files
        if [ -f "out/index.html" ]; then
            echo "   ✅ Index page generated"
        else
            echo "   ❌ Index page missing"
            exit 1
        fi
        
        # Check for Next.js assets
        if [ -d "out/_next" ]; then
            echo "   ✅ Next.js assets generated"
        else
            echo "   ❌ Next.js assets missing"
            exit 1
        fi
        
        # Show build statistics
        echo "   Build Statistics:"
        echo "     HTML files: $(find out -name "*.html" | wc -l)"
        echo "     JS files: $(find out -name "*.js" | wc -l)"
        echo "     CSS files: $(find out -name "*.css" | wc -l)"
        echo "     Total files: $(find out -type f | wc -l)"
        
    else
        echo "   ❌ Static export failed - no /out directory"
        exit 1
    fi
else
    echo "   ❌ Build process failed"
    cat build.log
    exit 1
fi

# Step 3: Test deployment readiness
echo "3. Testing deployment readiness..."

# Check for deployment-critical files
deployment_files=("out/index.html" "out/_next/static")
for file in "${deployment_files[@]}"; do
    if [ -e "out/$file" ] || [ -e "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file missing"
        exit 1
    fi
done

# Test file sizes (should be reasonable for static hosting)
large_files=$(find out -type f -size +2M 2>/dev/null | wc -l)
if [ "$large_files" -eq 0 ]; then
    echo "   ✅ No files larger than 2MB (good for static hosting)"
else
    echo "   ⚠️  Found $large_files files larger than 2MB"
fi

# Restore .env.local
if [ -f ".env.local.temp" ]; then
    mv .env.local.temp .env.local
    echo "   ✅ Restored .env.local"
fi

echo ""
echo "=== FINAL DEPLOYMENT TEST RESULTS ==="
echo "✅ Environment isolation: PASSED"
echo "✅ Build process: PASSED"
echo "✅ Static export: PASSED"
echo "✅ Deployment readiness: PASSED"
echo ""
echo "🎉 DEPLOYMENT READY FOR REPLIT AUTOSCALE!"
echo ""
echo "Instructions:"
echo "1. In Replit, click Deploy → Autoscale"
echo "2. Select 'Static Site' deployment type"
echo "3. Set publish directory to: out"
echo "4. Set build command to: ./build-staging-fixed.sh"
echo "5. Deploy!"
echo ""
echo "The static export is ready in the /out directory"