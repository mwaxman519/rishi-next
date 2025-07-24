#!/bin/bash

echo "🔍 VOLTBUILDER ANDROID BUILD REQUIREMENTS VERIFICATION"
echo ""

# Check for required files
echo "📁 REQUIRED FILES CHECK:"
files=(
    "gradlew"
    "gradlew.bat" 
    "gradle/wrapper/gradle-wrapper.properties"
    "gradle/wrapper/gradle-wrapper.jar"
    "app/build.gradle"
    "build.gradle"
    "settings.gradle"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""
echo "🧪 GRADLE WRAPPER VERIFICATION:"

# Check gradlew executable permissions
if [ -x gradlew ]; then
    echo "✅ gradlew is executable"
else
    echo "❌ gradlew is not executable"
    chmod +x gradlew
    echo "✅ Fixed gradlew permissions"
fi

# Check gradle-wrapper.jar size
if [ -f gradle/wrapper/gradle-wrapper.jar ]; then
    JAR_SIZE=$(stat -c%s gradle/wrapper/gradle-wrapper.jar 2>/dev/null || echo 0)
    if [ "$JAR_SIZE" -gt 50000 ]; then
        echo "✅ gradle-wrapper.jar size: ${JAR_SIZE} bytes (looks good)"
    else
        echo "❌ gradle-wrapper.jar size: ${JAR_SIZE} bytes (too small, likely corrupted)"
        exit 1
    fi
else
    echo "❌ gradle-wrapper.jar missing"
    exit 1
fi

# Check JVM options in gradlew
if grep -q "DEFAULT_JVM_OPTS.*-Xmx64m.*-Xms64m" gradlew; then
    echo "✅ JVM options correctly configured in gradlew"
else
    echo "❌ JVM options incorrectly configured in gradlew"
    exit 1
fi

# Check for problematic text patterns that VoltBuilder corrupts
if grep -r "classpath" . --exclude="*.jar" --exclude="verify-build-requirements.sh" 2>/dev/null; then
    echo "⚠️  Found 'classpath' references that VoltBuilder may corrupt"
else
    echo "✅ No corruption-vulnerable text patterns found"
fi

echo ""
echo "✅ ALL VOLTBUILDER ANDROID BUILD REQUIREMENTS VERIFIED"
