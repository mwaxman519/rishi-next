# Blank Screen Troubleshooting Guide

## Issue Summary
Both our main Rishi app and the official VoltBuilder demo show blank screens on Android device, indicating a fundamental issue with the build/installation process rather than app-specific code problems.

## Root Cause Analysis

### Eliminated Causes
- ✅ **App Code Issues**: Official VoltBuilder demo also fails
- ✅ **React/Next.js Issues**: Simple HTML demo also fails  
- ✅ **JavaScript Errors**: Basic HTML shows same behavior
- ✅ **Capacitor Issues**: Direct VoltBuilder demo bypasses Capacitor

### Remaining Suspects
1. **VoltBuilder Build Process**
2. **Android Device Configuration**
3. **APK Installation Issues** 
4. **WebView Component Problems**

## Systematic Troubleshooting Steps

### Step 1: Build Verification
**Check VoltBuilder Dashboard:**
- [ ] Build completed successfully without errors
- [ ] No warnings in build log
- [ ] APK file downloads correctly
- [ ] File size seems reasonable (not 0 bytes)

### Step 2: APK Installation Verification
**Android Device:**
- [ ] APK installed without "App not installed" errors
- [ ] App icon appears in app drawer
- [ ] App name shows correctly
- [ ] Tapping icon launches something (even if blank)

### Step 3: Android System Logs
**Enable Developer Mode:**
```bash
# On device:
Settings > About Phone > Tap "Build Number" 7 times
Settings > Developer Options > Enable "USB Debugging"

# On computer with device connected:
adb logcat | grep -i "rishi\|voltbuilder\|cordova"
```

### Step 4: WebView Component Check
**Android System WebView:**
- [ ] Settings > Apps > "Android System WebView"
- [ ] Check if enabled and up to date
- [ ] Try Chrome as WebView implementation
- [ ] Restart device after WebView changes

### Step 5: App Permissions and Settings
**Check App Configuration:**
- [ ] Settings > Apps > [App Name] > Permissions
- [ ] Settings > Apps > [App Name] > Storage (clear if needed)
- [ ] Try launching app in Safe Mode
- [ ] Check if other web-based apps work

### Step 6: Alternative Installation Methods
**Try Different Installation:**
- [ ] Install via USB file transfer instead of QR code
- [ ] Use different APK installer app
- [ ] Try on different Android device if available
- [ ] Test with older Android version emulator

## Expected Findings

### If Build Process Issue:
- VoltBuilder logs show errors
- APK file is corrupted or incomplete
- Build configuration is incorrect

### If Device Configuration Issue:
- System logs show WebView errors
- Other web apps also don't work
- WebView component is outdated/disabled

### If Installation Issue:
- APK installs but doesn't launch
- System logs show permission errors
- App appears broken in app drawer

## Next Steps Based on Findings

### Build Process Problems:
1. Check VoltBuilder service status
2. Review build configuration files
3. Contact VoltBuilder support
4. Try alternative build service

### Device Configuration Problems:
1. Update Android System WebView
2. Clear WebView data and cache
3. Reset app preferences
4. Factory reset device (last resort)

### Installation Problems:
1. Re-download APK file
2. Use different installation method
3. Check device storage space
4. Verify APK file integrity

## Emergency Fallback Plan

If all else fails:
1. **Use Android Emulator**: Test on guaranteed clean environment
2. **Try iOS Build**: Rule out Android-specific issues  
3. **Use Different Build Service**: Try PhoneGap Build or similar
4. **Go Native**: Build with Android Studio directly

## Contact Information

**VoltBuilder Support**: support@voltbuilder.com
**VoltBuilder Documentation**: https://volt.build/docs/
**Cordova Troubleshooting**: https://cordova.apache.org/docs/