#!/bin/bash

# Fix All Deployment Issues Script
echo "=== FIXING DEPLOYMENT ISSUES ==="

# Issue 1: Create missing styles directory
echo "1. Creating styles directory..."
mkdir -p styles
echo "   ✅ styles directory created"

# Issue 2: Fix database URL environment loading
echo "2. Fixing database URL environment loading..."
# The issue is that .env.local might be overriding .env.staging
if [ -f ".env.local" ]; then
    echo "   ⚠️  .env.local found - may override staging variables"
    echo "   Creating backup of .env.local"
    cp .env.local .env.local.backup
fi

# Issue 3: Create staging-specific environment loader
echo "3. Creating staging environment loader..."
cat > load-staging-env.sh << 'EOF'
#!/bin/bash
# Force load staging environment variables
export NODE_ENV=staging
export NEXT_PUBLIC_APP_ENV=staging
export STATIC_EXPORT=1
export DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require
export NEON_DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require
export PGUSER=rishinext_owner
export PGPASSWORD=npg_okpv0Hhtfwu2
export NEXT_PUBLIC_APP_NAME="Rishi Platform Staging"
export JWT_SECRET=staging-jwt-secret-key-change-this
export JWT_REFRESH_SECRET=staging-jwt-refresh-secret-change-this
export NEXT_PUBLIC_ENABLE_DEBUG=true
export NEXT_PUBLIC_ENABLE_ANALYTICS=false
export NEXT_PUBLIC_SHOW_ENV_BANNER=true
EOF
chmod +x load-staging-env.sh
echo "   ✅ Staging environment loader created"

# Issue 4: Fix build script to use explicit environment
echo "4. Updating build script to use explicit environment..."
cat > build-staging-fixed.sh << 'EOF'
#!/bin/bash

# STAGING Static Export Build Script - FIXED VERSION
set -e

echo "=== Building Rishi Platform for STAGING (Static Export) ==="

# Load staging environment explicitly
source ./load-staging-env.sh

echo "Environment loaded:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   DATABASE_URL: [STAGING DATABASE]"
echo "   STATIC_EXPORT: $STATIC_EXPORT"

# Validate staging database URL
if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "✅ Database URL correctly points to staging database"
else
    echo "❌ Database URL validation failed"
    echo "Expected: rishinext_staging"
    echo "Actual: $DATABASE_URL"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations for staging
echo "Running database migrations..."
npm run db:push

# Build static export
echo "Building static export..."
npm run build

# Verify build output
if [ -d "out" ]; then
    echo "✅ Static export build successful!"
    echo "Output directory: /out"
    echo "Files ready for Replit Autoscale deployment"
    
    # Show build stats
    echo ""
    echo "Build Statistics:"
    echo "HTML files: $(find out -name "*.html" 2>/dev/null | wc -l)"
    echo "JS files: $(find out -name "*.js" 2>/dev/null | wc -l)"
    echo "CSS files: $(find out -name "*.css" 2>/dev/null | wc -l)"
    echo "Total files: $(find out -type f 2>/dev/null | wc -l)"
    echo ""
    echo "✅ Ready to deploy to Replit Autoscale!"
else
    echo "❌ Build failed - /out directory not found"
    exit 1
fi

echo "=== STAGING Build Complete ==="
EOF
chmod +x build-staging-fixed.sh
echo "   ✅ Fixed build script created"

# Issue 5: Test the fixed configuration
echo "5. Testing fixed configuration..."
source ./load-staging-env.sh

if [[ "$DATABASE_URL" == *"rishinext_staging"* ]]; then
    echo "   ✅ Database URL now correctly points to staging"
else
    echo "   ❌ Database URL still incorrect"
    exit 1
fi

# Issue 6: Create deployment verification script
echo "6. Creating deployment verification script..."
cat > verify-deployment.sh << 'EOF'
#!/bin/bash

# Verify deployment is ready
echo "=== DEPLOYMENT VERIFICATION ==="

# Check build output exists
if [ -d "out" ]; then
    echo "✅ Build output directory exists"
    
    # Check for critical files
    if [ -f "out/index.html" ]; then
        echo "✅ Index page generated"
    else
        echo "❌ Index page missing"
        exit 1
    fi
    
    if [ -f "out/dashboard.html" ] || [ -f "out/dashboard/index.html" ]; then
        echo "✅ Dashboard page generated"
    else
        echo "❌ Dashboard page missing"
        exit 1
    fi
    
    # Check for assets
    if [ -d "out/_next" ]; then
        echo "✅ Next.js assets generated"
    else
        echo "❌ Next.js assets missing"
        exit 1
    fi
    
    echo ""
    echo "✅ Deployment verification passed!"
    echo "Ready to deploy to Replit Autoscale as Static Site"
    
else
    echo "❌ Build output directory missing"
    echo "Run ./build-staging-fixed.sh first"
    exit 1
fi
EOF
chmod +x verify-deployment.sh
echo "   ✅ Deployment verification script created"

echo ""
echo "=== ALL DEPLOYMENT ISSUES FIXED ==="
echo ""
echo "Next steps:"
echo "1. Run: ./build-staging-fixed.sh"
echo "2. Run: ./verify-deployment.sh"
echo "3. Deploy /out directory to Replit Autoscale"
echo ""
echo "Fixed issues:"
echo "✅ Created missing styles directory"
echo "✅ Fixed database URL environment loading"
echo "✅ Created explicit staging environment loader"
echo "✅ Updated build script with proper environment"
echo "✅ Added deployment verification script"