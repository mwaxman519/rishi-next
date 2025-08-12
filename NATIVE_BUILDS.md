# Native Mobile App Builds

This guide explains how to build and deploy native mobile apps for both staging and production environments using VoltBuilder.

## Overview

The Rishi platform supports multi-environment native app builds with:
- **Staging Environment**: Internal testing and QA
- **Production Environment**: Public app store releases
- **Side-by-side Installation**: Different bundle IDs allow both versions to coexist
- **Static Offline-First**: No API routes in the app bundle, all API calls go to remote servers

## Environment Configuration

### Staging (.env.native.staging)
- **API Base**: `https://rishi-staging.replit.app`
- **App Name**: `Rishi (Staging)`
- **iOS Bundle ID**: `co.rishi.app.staging`
- **Android App ID**: `co.rishi.app.staging`

### Production (.env.native.prod)
- **API Base**: `https://rishi-next.vercel.app`
- **App Name**: `Rishi`
- **iOS Bundle ID**: `co.rishi.app`
- **Android App ID**: `co.rishi.app`

## Building Apps

### Build Staging Version
```bash
# Run the staging build
bash build-native-staging.sh

# Output: release/rishi-capacitor-staging.zip
```

### Build Production Version
```bash
# Run the production build
bash build-native-prod.sh

# Output: release/rishi-capacitor-prod.zip
```

## Build Process

Each build performs these steps:

1. **Environment Setup**: Loads environment variables from .env files
2. **Validation**: Checks for proper API imports and service worker setup
3. **Static Export**: Creates a static Next.js build without API routes
4. **Capacitor Sync**: Copies static files to native platforms
5. **VoltBuilder Config**: Generates environment-specific voltbuilder.json
6. **Packaging**: Creates a zip file ready for VoltBuilder upload

## VoltBuilder Setup

### Signing Configuration

**Android Keystores**:
- Staging: `rishi-android-staging`
- Production: `rishi-android-prod`

**iOS Provisioning**:
- Staging Bundle: `co.rishi.app.staging`
- Production Bundle: `co.rishi.app`
- Staging Profile: `rishi-ios-staging`
- Production Profile: `rishi-ios-prod`

### Upload Process

1. **Upload Zip**: Upload the generated zip file to VoltBuilder
2. **Select Platform**: Choose Android or iOS
3. **Choose Signing**: Select the appropriate keystore/provisioning profile
4. **Build**: Wait for VoltBuilder to compile the app
5. **Download**: Get the signed APK or IPA file

## Distribution

### Staging Distribution
- **Android**: Play Console Internal Testing or Closed Testing
- **iOS**: TestFlight for internal testing
- **Purpose**: QA, stakeholder review, beta testing

### Production Distribution
- **Android**: Play Store Production release
- **iOS**: App Store production release
- **Purpose**: Public availability

## Environment-Specific Features

### Push Notifications
Configure environment-specific push notification keys:
- **FCM/APNs Topics**: Use different topics for staging vs production
- **PostHog Analytics**: Separate project keys for each environment

### API Base URLs
- **Staging**: Points to Replit-hosted development API
- **Production**: Points to Vercel-hosted production API
- **Offline Support**: Critical features work offline, sync when connected

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that all fetch('/api calls have been replaced with apiFetch('/api
2. **Missing Dependencies**: Ensure all @capacitor packages are installed
3. **Signing Errors**: Verify keystore/provisioning profile names in VoltBuilder
4. **API Errors**: Check that NEXT_PUBLIC_API_BASE_URL is correctly set

### Debug Commands

```bash
# Validate build requirements
bash scripts/native/validate-build.sh

# Check for remaining fetch('/api calls
grep -r "fetch('/api" app/ || echo "All clean!"

# Test static export
bash scripts/native/export-static.sh

# Verify VoltBuilder config
node scripts/native/gen-voltbuilder-json.js && cat voltbuilder.json
```

## Version Management

- **App Version**: Read from package.json
- **Android Version Code**: Auto-incremented with each build
- **iOS Bundle Version**: Matches Android version code
- **Build Numbers**: Stored in `scripts/native/.android_version_code`

## Architecture

The native app is a static, offline-first Capacitor application that:

1. **Loads Instantly**: Static files cached on device
2. **Works Offline**: Core functionality available without internet
3. **Syncs Online**: API calls to remote servers when connected
4. **Updates Seamlessly**: New versions deployed via app stores

## Next Steps

1. Set up VoltBuilder account with proper signing certificates
2. Configure push notification services for each environment
3. Set up app store listings for both environments
4. Implement automated CI/CD for regular builds