# Native Mobile App Build Guide

## Quick Start Guide for Native Android APK and iOS IPA Files

Your Rishi Platform can be converted to native mobile apps using Capacitor. Here's how to generate installable APK and IPA files:

### Prerequisites

1. **Node.js**: Already installed ✅
2. **Android Studio**: Download from https://developer.android.com/studio
3. **Xcode**: (iOS only, macOS required) Download from Mac App Store
4. **Java JDK**: Download from https://www.oracle.com/java/technologies/downloads/

### Step 1: Build the Web App

```bash
# Build the Next.js app for static export
npm run build
```

### Step 2: Initialize Capacitor (if not done)

```bash
# Initialize Capacitor with your app details
npx cap init "Rishi Platform" "com.rishi.platform" --web-dir=out
```

### Step 3: Add Mobile Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

### Step 4: Sync Web Assets

```bash
# Copy web assets to native platforms
npx cap sync
```

### Step 5: Build Android APK

```bash
# Method 1: Command line build (requires Android SDK)
npx cap build android

# Method 2: Open in Android Studio
npx cap open android
```

**In Android Studio:**
1. Select "Build" → "Generate Signed Bundle / APK"
2. Choose "APK" and click "Next"
3. Create a new keystore or use existing
4. Select "release" build variant
5. Click "Finish"
6. APK will be in `android/app/build/outputs/apk/release/`

### Step 6: Build iOS IPA (macOS only)

```bash
# Open in Xcode
npx cap open ios
```

**In Xcode:**
1. Select your development team
2. Choose "Product" → "Archive"
3. Click "Distribute App"
4. Choose distribution method (App Store, Ad Hoc, etc.)
5. Follow the wizard to export IPA

### Output Files

- **Android APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **iOS IPA**: Created through Xcode's archive process

### Distribution

- **Android**: Upload APK to Google Play Console or distribute directly
- **iOS**: Upload IPA to App Store Connect or distribute via TestFlight

### Current Project Status

- ✅ Capacitor installed and configured
- ✅ Android platform added
- ✅ iOS platform available
- ✅ App configuration complete
- ✅ PWA features included (offline support, push notifications)

### App Features in Native Build

- **Full PWA capabilities** wrapped in native container
- **Push notifications** for booking alerts
- **Offline functionality** for core features
- **Native navigation** and performance
- **Background sync** for data updates
- **Device integration** (camera, GPS, etc.)

### Troubleshooting

1. **Build fails**: Ensure Android SDK/Xcode properly installed
2. **No web assets**: Run `npm run build` first
3. **Sync errors**: Check `out/` directory contains `index.html`
4. **Permission issues**: Check Android manifest permissions

### Next Steps

1. Build the web app: `npm run build`
2. Install Android Studio
3. Run the build commands above
4. Test on device or emulator

Your native mobile apps will have the same functionality as your PWA but packaged as installable APK/IPA files that users can download and install directly.