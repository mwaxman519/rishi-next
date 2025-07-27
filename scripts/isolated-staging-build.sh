#!/bin/bash

echo "=== ISOLATED STAGING BUILD ==="
echo "Building staging in separate directory to prevent dev corruption"

# Create isolated build directory
mkdir -p staging-build-temp
cd staging-build-temp

# Copy source files (exclude .next to prevent contamination)
rsync -av --exclude='.next' --exclude='node_modules' --exclude='staging-build-temp' ../ ./

# Set staging environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=8192"

echo "🚀 Starting isolated staging build..."
start_time=$(date +%s)

# Run isolated build
npm ci --silent
npx next build

end_time=$(date +%s)
duration=$((end_time - start_time))

echo "✅ Isolated staging build completed in ${duration} seconds"

# Package for deployment
if [ -d ".next" ]; then
    build_size=$(du -sh .next | cut -f1)
    echo "📦 Build size: ${build_size}"
    
    # Copy build to parent directory for deployment
    cp -r .next ../staging-build-output
    echo "📁 Staging build ready at: staging-build-output/"
fi

# Return to main directory
cd ..
rm -rf staging-build-temp

echo "=== ISOLATED STAGING BUILD COMPLETE ==="
echo "✅ Development environment unaffected"