#!/bin/bash

# VoltBuilder Package Creation Script
echo "🚀 Creating VoltBuilder package..."

# Create package directory
mkdir -p voltbuilder-package

# Copy essential files
echo "📄 Copying configuration files..."
cp capacitor.config.ts voltbuilder-package/
cp package.json voltbuilder-package/

# Copy directories
echo "📁 Copying directories..."
cp -r public voltbuilder-package/ 2>/dev/null || echo "No public directory"
cp -r components voltbuilder-package/ 2>/dev/null || echo "No components directory"
cp -r lib voltbuilder-package/ 2>/dev/null || echo "No lib directory"
cp -r app voltbuilder-package/ 2>/dev/null || echo "No app directory"
cp -r android voltbuilder-package/ 2>/dev/null || echo "No android directory"
cp -r ios voltbuilder-package/ 2>/dev/null || echo "No ios directory"

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