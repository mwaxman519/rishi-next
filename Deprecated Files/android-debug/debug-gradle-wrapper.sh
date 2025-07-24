#!/bin/bash

echo "🔍 GRADLE WRAPPER DEBUG INFORMATION"
echo ""

echo "📁 FILE EXISTENCE CHECK:"
echo -n "gradlew: "
if [ -f gradlew ]; then
    echo "✅ EXISTS ($(stat -c%s gradlew 2>/dev/null || stat -f%z gradlew 2>/dev/null) bytes)"
    echo -n "Executable: "
    if [ -x gradlew ]; then
        echo "✅ YES"
    else
        echo "❌ NO"
    fi
else
    echo "❌ MISSING"
fi

echo -n "gradle-wrapper.jar: "
if [ -f gradle/wrapper/gradle-wrapper.jar ]; then
    JAR_SIZE=$(stat -c%s gradle/wrapper/gradle-wrapper.jar 2>/dev/null || stat -f%z gradle/wrapper/gradle-wrapper.jar 2>/dev/null)
    echo "✅ EXISTS ($JAR_SIZE bytes)"
    
    # Check if jar is valid
    if command -v unzip >/dev/null 2>&1; then
        if unzip -t gradle/wrapper/gradle-wrapper.jar >/dev/null 2>&1; then
            echo "  ✅ JAR is valid ZIP file"
            # Check for main class
            if unzip -l gradle/wrapper/gradle-wrapper.jar | grep -q "GradleWrapperMain.class"; then
                echo "  ✅ Contains GradleWrapperMain.class"
            else
                echo "  ❌ Missing GradleWrapperMain.class"
            fi
        else
            echo "  ❌ JAR is corrupted or invalid"
        fi
    fi
else
    echo "❌ MISSING"
fi

echo ""
echo "🔍 CORRUPTION CHECK:"
echo -n "Checking for 'classpath' text in gradlew: "
if grep -q "classpath" gradlew 2>/dev/null; then
    echo "❌ FOUND (may be corrupted by VoltBuilder)"
    grep -n "classpath" gradlew
else
    echo "✅ NOT FOUND (corruption-resistant)"
fi

echo -n "Checking for 'lasspath' corruption in gradlew: "
if grep -q "lasspath" gradlew 2>/dev/null; then
    echo "❌ CORRUPTION DETECTED"
    grep -n "lasspath" gradlew
else
    echo "✅ NO CORRUPTION"
fi

echo ""
echo "🧪 TESTING GRADLE WRAPPER:"
# Try to run gradlew with simple command
if [ -x gradlew ]; then
    echo "Testing: ./gradlew --version"
    timeout 5 ./gradlew --version 2>&1 | head -5
else
    echo "❌ Cannot test - gradlew not executable"
fi
