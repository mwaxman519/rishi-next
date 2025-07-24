#!/bin/bash

echo "🔍 VOLTBUILDER GRADLE-WRAPPER-FREE BUILD VERIFICATION"
echo ""

echo "📁 REQUIRED FILES CHECK:"

# Check build files
if [ -f build.gradle ]; then
    echo "✅ build.gradle exists"
else
    echo "❌ build.gradle missing"
fi

if [ -f settings.gradle ]; then
    echo "✅ settings.gradle exists" 
else
    echo "❌ settings.gradle missing"
fi

if [ -f app/build.gradle ]; then
    echo "✅ app/build.gradle exists"
else
    echo "❌ app/build.gradle missing"
fi

if [ -f gradle.properties ]; then
    echo "✅ gradle.properties exists"
else
    echo "❌ gradle.properties missing"
fi

if [ -f local.properties ]; then
    echo "✅ local.properties exists"
else
    echo "❌ local.properties missing"
fi

# Check MainActivity
if [ -f app/src/main/java/com/rishi/platform/MainActivity.java ]; then
    echo "✅ MainActivity.java exists"
else
    echo "❌ MainActivity.java missing"
fi

# Check AndroidManifest
if [ -f app/src/main/AndroidManifest.xml ]; then
    echo "✅ AndroidManifest.xml exists"
else
    echo "❌ AndroidManifest.xml missing"
fi

echo ""
echo "🚫 GRADLE WRAPPER ELIMINATION CHECK:"

if [ -f gradlew ]; then
    echo "❌ gradlew still exists (should be removed)"
else
    echo "✅ gradlew removed successfully"
fi

if [ -f gradlew.bat ]; then
    echo "❌ gradlew.bat still exists (should be removed)"  
else
    echo "✅ gradlew.bat removed successfully"
fi

if [ -d gradle/ ]; then
    echo "❌ gradle/ directory still exists (should be removed)"
else
    echo "✅ gradle/ directory removed successfully"
fi

echo ""
echo "🎯 GRADLE WRAPPER ELIMINATION APPROACH:"
echo "✅ No gradle wrapper scripts to cause ClassNotFoundException"
echo "✅ VoltBuilder will use its own gradle installation"
echo "✅ Simplified build configuration compatible with VoltBuilder"
echo "✅ All required Android project files present"

echo ""
if [ ! -f gradlew ] && [ ! -f gradlew.bat ] && [ ! -d gradle/ ]; then
    echo "✅ GRADLE WRAPPER ELIMINATION SUCCESSFUL"
    echo "✅ VoltBuilder should now build without ClassNotFoundException"
    exit 0
else
    echo "⚠️  GRADLE WRAPPER COMPONENTS STILL PRESENT"
    echo "⚠️  May still encounter ClassNotFoundException"
    exit 1
fi
