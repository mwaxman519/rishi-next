# Rishi Platform Native Mobile Build Guide

## Overview
This guide explains how to build native mobile apps (Android APK / iOS IPA) for the Rishi Platform using VoltBuilder cloud service.

## Prerequisites
- Node.js 18+ installed
- VoltBuilder account (https://volt.build)
- VoltSigner account for code signing

## Architecture
The native apps are built as Progressive Web Apps (PWA) using:
- **Next.js** - Static export for the web UI
- **Capacitor** - Native wrapper for iOS/Android
- **VoltBuilder** - Cloud build service
- **Service Worker** - Offline support with smart caching strategies

## Build Process

### 1. Build the Native Package

Run the build script to create a VoltBuilder-ready package:

```bash
./build-native.sh
```

This script will:
1. Clean previous builds
2. Build a static Next.js export to `./out`
3. Copy files to Capacitor platforms
4. Sync Capacitor configuration
5. Create `release/rishi-capacitor.zip`

### 2. Upload to VoltBuilder

1. Go to [VoltBuilder](https://volt.build)
2. Create a new app or select existing "Rishi Platform" app
3. Upload `release/rishi-capacitor.zip`
4. Select target platforms (Android/iOS)

### 3. Configure Signing with VoltSigner

#### For Android:
1. Go to VoltSigner in your VoltBuilder dashboard
2. Create/Select Android signing key with alias: `rishi-android`
3. Upload your keystore or let VoltBuilder generate one
4. Apply to your build

#### For iOS:
1. Go to VoltSigner in your VoltBuilder dashboard
2. Upload provisioning profile: `rishi-ios-appstore`
3. Upload signing certificate: `rishi-ios-dist`
4. Apply to your build

### 4. Build and Download

1. Click "Build" in VoltBuilder
2. Wait for build completion (usually 2-5 minutes)
3. Download the generated APK (Android) or IPA (iOS)

## Configuration Files

### capacitor.config.ts
- App ID: `co.rishi.app`
- App Name: `Rishi Platform`
- Web Directory: `out` (Next.js static export)
- Android Scheme: `https` (no cleartext allowed)

### voltbuilder.json
- Defines build settings for both platforms
- Android: APK package, min SDK 24, target SDK 34
- iOS: App Store package, deployment target 13.0
- Includes necessary permissions and plugins

### manifest.json
- PWA manifest for installable web app
- Icons, theme colors, and app metadata
- Offline support configuration

### Service Worker (sw.js)
- **Cache-first**: JS/CSS/fonts/images
- **Stale-while-revalidate**: App shell, non-critical JSON
- **Network-first**: Authenticated API calls
- Graceful offline fallback

## Environment Configuration

The native apps connect to production APIs:
- **API URL**: https://rishi-next.vercel.app
- **Database**: Production Neon PostgreSQL
- **Redis**: Production Upstash Redis

All environment variables are configured to use production values when building the static export.

## Offline Support

The app includes comprehensive offline support:
- Service Worker caches critical assets
- Offline storage using Capacitor Preferences
- Queue system for syncing actions when back online
- Graceful fallback UI when offline

## Testing

### Android Testing
1. Enable "Unknown Sources" in Android settings
2. Transfer APK to device
3. Install and run

### iOS Testing
1. Use TestFlight for distribution
2. Or install via Xcode with development provisioning

## Troubleshooting

### Build Fails
- Check `voltbuilder.json` syntax
- Verify all plugins are installed
- Check capacitor.config.ts is valid

### App Won't Install
- Android: Enable "Unknown Sources"
- iOS: Check provisioning profile matches device

### Offline Not Working
- Verify service worker is registered
- Check browser DevTools > Application > Service Workers
- Clear cache and reinstall

## Commands Reference

```bash
# Build native package
./build-native.sh

# Build static Next.js only
npx next build --config next.config.static.mjs

# Copy to Capacitor
npx cap copy

# Sync Capacitor
npx cap sync

# Open Android Studio (local dev)
npx cap open android

# Open Xcode (local dev)
npx cap open ios
```

## Support

For issues with:
- **VoltBuilder**: support@volt.build
- **Capacitor**: https://capacitorjs.com/docs
- **Next.js**: https://nextjs.org/docs