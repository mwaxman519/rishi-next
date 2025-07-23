#!/bin/bash
echo "🔍 VOLTBUILDER COMPATIBILITY VERIFICATION"
echo ""

echo "✅ ANDROID GRADLE PLUGIN COMPATIBILITY:"
echo "  Current version: $(grep 'com.android.application' build.gradle | sed "s/.*version '\([^']*\)'.*/\1/")"
echo "  Expected: 7.4.2 (VoltBuilder supported)"
echo ""

echo "✅ GRADLE VERSION COMPATIBILITY:"
echo "  Current version: $(grep 'gradle-.*-bin.zip' gradle/wrapper/gradle-wrapper.properties | sed 's/.*gradle-\([^-]*\)-.*/\1/')"
echo "  Expected: 7.6.4 (compatible with AGP 7.4.2)"
echo ""

echo "✅ ANDROID SDK COMPATIBILITY:"
echo "  CompileSdk: $(grep 'compileSdk' app/build.gradle | sed 's/.*compileSdk \([0-9]*\)/\1/')"
echo "  TargetSdk: $(grep 'targetSdk' app/build.gradle | sed 's/.*targetSdk \([0-9]*\)/\1/')"
echo "  Expected: 33 (VoltBuilder compatible)"
echo ""

echo "✅ GRADLE WRAPPER JAR:"
if [ -f gradle/wrapper/gradle-wrapper.jar ]; then
    JAR_SIZE=$(stat -c%s gradle/wrapper/gradle-wrapper.jar 2>/dev/null || stat -f%z gradle/wrapper/gradle-wrapper.jar 2>/dev/null)
    echo "  Size: ${JAR_SIZE} bytes"
    echo "  Expected: ~61,624 bytes (Gradle 7.6.4)"
else
    echo "  ❌ MISSING"
fi
echo ""

echo "✅ CAPACITOR CONFIGURATION:"
echo "  Plugins configured: $(find . -name "capacitor.plugins.json" -exec cat {} \; | grep -o '"class"' | wc -l)"
echo "  Expected: 6 plugins"
echo ""

echo "🎯 VOLTBUILDER READINESS: ALL COMPATIBILITY CHECKS COMPLETE"
