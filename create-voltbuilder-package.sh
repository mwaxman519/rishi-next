#!/bin/bash

# VoltBuilder Package Creation Script
echo "🚀 Creating VoltBuilder package..."

# Create package directory
mkdir -p voltbuilder-package

# Copy essential files
echo "📄 Copying configuration files..."
cp capacitor.config.ts voltbuilder-package/
cp package.json voltbuilder-package/
cp voltbuilder.json voltbuilder-package/ 2>/dev/null || echo "⚠️ voltbuilder.json not found"

# Copy directories
echo "📁 Copying directories..."
cp -r public voltbuilder-package/ 2>/dev/null || echo "No public directory"
cp -r components voltbuilder-package/ 2>/dev/null || echo "No components directory"
cp -r lib voltbuilder-package/ 2>/dev/null || echo "No lib directory"
cp -r app voltbuilder-package/ 2>/dev/null || echo "No app directory"
cp -r shared voltbuilder-package/ 2>/dev/null || echo "No shared directory"
cp -r styles voltbuilder-package/ 2>/dev/null || echo "No styles directory"
cp -r types voltbuilder-package/ 2>/dev/null || echo "No types directory"
cp -r android voltbuilder-package/ 2>/dev/null || echo "No android directory"
cp -r ios voltbuilder-package/ 2>/dev/null || echo "No ios directory"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp next.config.mjs voltbuilder-package/ 2>/dev/null || echo "No next.config.mjs"
cp tailwind.config.js voltbuilder-package/ 2>/dev/null || echo "No tailwind.config.js"
cp tsconfig.json voltbuilder-package/ 2>/dev/null || echo "No tsconfig.json"
cp postcss.config.js voltbuilder-package/ 2>/dev/null || echo "No postcss.config.js"

# Copy additional critical files
echo "🔧 Copying additional files..."
cp .eslintrc.json voltbuilder-package/ 2>/dev/null || echo "No .eslintrc.json"
cp .env.example voltbuilder-package/ 2>/dev/null || echo "No .env.example"

# Create a simple web directory structure
echo "📱 Creating web assets structure..."
mkdir -p voltbuilder-package/www
echo '<!DOCTYPE html><html><head><title>Rishi Platform</title></head><body><h1>Rishi Platform</h1><p>Loading...</p></body></html>' > voltbuilder-package/www/index.html

# Create zip file
echo "📦 Creating zip package..."
cd voltbuilder-package
zip -r ../rishi-platform-$(date +%Y-%m-%d).zip .
cd ..

# Cleanup
rm -rf voltbuilder-package

echo "✅ VoltBuilder package created: rishi-platform-$(date +%Y-%m-%d).zip"
echo "📋 Next steps:"
echo "1. Go to https://voltbuilder.com/"
echo "2. Sign up for free trial"
echo "3. Upload the zip file"
echo "4. Build your mobile apps!"