# VoltBuilder Circular Pattern Resolution Plan

## Problem Statement
We're stuck in a circular pattern with VoltBuilder gradle wrapper issues:
1. **With gradle wrapper** → Fails with `ClassNotFoundException: org.gradle.wrapper.GradleWrapperMain`
2. **Without gradle wrapper** → Fails with `sh: 0: cannot open /android/gradlew: No such file`

## Root Cause Analysis
- VoltBuilder appears to corrupt the gradle wrapper during processing (changes "classpath" to "lasspath")
- But VoltBuilder still requires gradlew to exist to initiate the Android build
- Official gradle-wrapper.jar (61KB) still fails, suggesting corruption happens during VoltBuilder processing

## Definitive Solution Plan

### Approach 1: Corruption-Proof Gradle Wrapper (IMPLEMENTED)
- Create gradlew script that uses `-cp` parameter instead of "classpath" text
- Avoids the text pattern that VoltBuilder corrupts
- Maintains full gradle wrapper functionality
- Package: `rishi-voltbuilder-CORRUPTION-PROOF-[timestamp].zip`

### Approach 2: Minimal Stub Gradlew (FALLBACK)
If Approach 1 fails:
```bash
#!/bin/sh
# Minimal gradlew stub for VoltBuilder
echo "Gradle build starting..."
# Let VoltBuilder handle the actual gradle execution
exit 0
```

### Approach 3: VoltBuilder-Specific Gradle (ALTERNATIVE)
If both above fail:
- Create custom gradle scripts that work around VoltBuilder's specific requirements
- Use environment detection to handle VoltBuilder vs local builds differently

### Approach 4: Contact VoltBuilder Support (LAST RESORT)
If all technical approaches fail:
- Document the exact corruption pattern
- Submit support ticket with evidence of "classpath" → "lasspath" corruption
- Request guidance on proper gradle wrapper configuration

## Expected Outcomes

### Success Criteria
1. Next.js build completes (✅ Already working)
2. Capacitor sync completes (✅ Already working)  
3. Android build starts without ClassNotFoundException
4. APK generation completes successfully

### Monitoring Points
- Check if gradlew exists and is executable
- Verify gradle-wrapper.jar is valid and contains GradleWrapperMain
- Monitor for text corruption patterns
- Capture exact error messages for each approach

## Implementation Status
- ✅ Approach 1 implemented with corruption-proof wrapper
- ⏳ Awaiting VoltBuilder test results
- 📋 Fallback approaches documented and ready

## Breaking the Cycle
The key insight is that VoltBuilder corrupts specific text patterns. By avoiding these patterns while maintaining required functionality, we can break the circular failure pattern.