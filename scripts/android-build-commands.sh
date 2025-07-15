#!/bin/bash

# Android Build Commands for VoltBuilder
echo "🤖 Android Build Helper Script"
echo "================================="

# Function to create VoltBuilder package
create_package() {
    echo "📦 Creating VoltBuilder package..."
    
    # Clean previous builds
    rm -rf voltbuilder-package
    rm -f rishi-platform-voltbuilder.zip
    
    # Create package directory
    mkdir -p voltbuilder-package
    
    # Copy essential files
    cp capacitor.config.ts voltbuilder-package/
    cp package.json voltbuilder-package/
    
    # Copy directories
    cp -r public voltbuilder-package/ 2>/dev/null || echo "No public directory"
    cp -r components voltbuilder-package/ 2>/dev/null || echo "No components directory"
    cp -r lib voltbuilder-package/ 2>/dev/null || echo "No lib directory"
    cp -r app voltbuilder-package/ 2>/dev/null || echo "No app directory"
    cp -r android voltbuilder-package/ 2>/dev/null || echo "No android directory"
    cp -r ios voltbuilder-package/ 2>/dev/null || echo "No ios directory"
    
    # Create web assets
    mkdir -p voltbuilder-package/www
    echo '<!DOCTYPE html><html><head><title>Rishi Platform</title></head><body><h1>Rishi Platform</h1><p>Loading...</p></body></html>' > voltbuilder-package/www/index.html
    
    # Create zip
    cd voltbuilder-package
    zip -r ../rishi-platform-voltbuilder.zip .
    cd ..
    
    # Cleanup
    rm -rf voltbuilder-package
    
    echo "✅ Package created: rishi-platform-voltbuilder.zip"
    echo "📁 Size: $(ls -lh rishi-platform-voltbuilder.zip | awk '{print $5}')"
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "1. Go to https://voltbuilder.com/"
    echo "2. Sign up for free trial"
    echo "3. Upload: rishi-platform-voltbuilder.zip"
    echo "4. Configure Android settings:"
    echo "   - App Name: Rishi Platform"
    echo "   - Package: com.rishi.platform"
    echo "   - Platform: Android only"
    echo "   - Build Type: Release"
    echo "5. Click 'Build Android'"
    echo "6. Download APK when complete"
    echo ""
    echo "📱 FIREBASE SETUP:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Create project: Rishi Platform"
    echo "3. Enable App Distribution"
    echo "4. Upload APK file"
    echo "5. Add testers and send invitations"
}

# Main execution
case "$1" in
    "package")
        create_package
        ;;
    "help")
        show_next_steps
        ;;
    *)
        create_package
        show_next_steps
        ;;
esac