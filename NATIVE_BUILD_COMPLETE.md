# Native Mobile Build - Complete Guide

## ✅ Build Status
**READY FOR DEPLOYMENT** - Fully static, offline-first Capacitor app configured

## 🚀 Quick Start

### Build the Native App Package
```bash
# Set production API endpoint (optional, defaults to production)
export NEXT_PUBLIC_API_BASE_URL=https://rishi-next.vercel.app

# Build the static export and create VoltBuilder package
./build-native.sh

# Output: release/rishi-capacitor.zip (ready for VoltBuilder)
```

## 📱 Architecture Overview

### 3-Environment Setup
1. **Development**: Local Replit (`https://[replit-domain].replit.dev`)
2. **Staging**: Replit Autoscale (`https://rishi-staging.replit.app`)
3. **Production**: Vercel (`https://rishi-next.vercel.app`)

### Build System
- **Static Export**: Next.js static generation for offline-first operation
- **API Integration**: Remote API calls to production backend
- **Service Worker**: Comprehensive caching and offline support
- **Capacitor**: Native wrapper for Android/iOS deployment

## 🔧 Configuration Files

### 1. `next.config.static.mjs`
Static export configuration for mobile builds:
- Output: `export` mode
- Directory: `out/`
- Images: Unoptimized for offline
- API Base: Configurable endpoint

### 2. `capacitor.config.ts`
Native app configuration:
- App ID: `co.rishi.app`
- App Name: `Rishi Platform`
- Web Dir: `out` (static export)
- Security: HTTPS only, no cleartext

### 3. `public/sw.js`
Service Worker v2.0.0:
- Cache-first: Static assets (JS/CSS/images)
- Network-first: API calls with offline queue
- Stale-while-revalidate: HTML pages
- Offline fallback: Complete offline support

### 4. `app/lib/api.ts`
Centralized API configuration:
- Dynamic base URL from environment
- Credentials included for auth
- Error handling for offline scenarios

## 📦 VoltBuilder Deployment

### Upload Package
1. Go to [VoltBuilder](https://app.voltbuilder.com)
2. Upload `release/rishi-capacitor.zip`
3. Select platforms: Android (APK) and iOS
4. Build and download native apps

### Android Configuration
- Min SDK: 24
- Target SDK: 34
- Keystore alias: `rishi-android`
- Package: `co.rishi.app`
- Permissions: Camera only (optimized)

### iOS Configuration
- Deployment target: 13.0
- Provisioning: `rishi-ios-appstore`
- Certificate: `rishi-ios-dist`
- Bundle ID: `co.rishi.app`

## 🔒 Security Features

### Environment Isolation
- No hardcoded credentials
- API endpoint configurable at build time
- HTTPS enforced for all communications
- No cleartext traffic allowed

### Offline Security
- Encrypted local storage via Capacitor Preferences
- Secure session management
- Queue system for authenticated requests
- Automatic sync when online

## 🏗️ Build Process Details

The `build-native.sh` script performs:

1. **Environment Setup**
   - Sets API base URL (defaults to production)
   - Backs up current Next.js config

2. **Static Export**
   - Switches to static export config
   - Temporarily disables API routes
   - Builds static HTML/JS/CSS

3. **Capacitor Integration**
   - Copies static files to native projects
   - Updates native configurations

4. **Package Creation**
   - Creates VoltBuilder-compatible ZIP
   - Includes all necessary dependencies
   - Optimizes package size (~2MB)

5. **Cleanup**
   - Restores original configuration
   - Re-enables API routes for development

## 📊 Offline Capabilities

### Cached Data
- Dashboard analytics
- Booking information
- Staff listings
- Inventory data
- Location details
- Training modules

### Sync Queue
- Automatic request queuing when offline
- Background sync when connection restored
- Conflict resolution for data updates
- Progress indicators for sync status

### Storage Strategy
- IndexedDB for structured data
- Cache API for resources
- Capacitor Preferences for settings
- Service Worker for request interception

## 🎯 Performance Optimizations

### Bundle Size
- Static export: ~2MB compressed
- Code splitting for lazy loading
- Tree shaking for unused code
- Image optimization disabled for offline

### Caching Strategy
- Aggressive caching for static assets
- Smart invalidation on updates
- Preloading critical resources
- Background updates for freshness

## 🐛 Troubleshooting

### Build Failures
```bash
# Clean build directories
rm -rf out .next node_modules/.cache

# Reinstall dependencies
npm ci

# Retry build
./build-native.sh
```

### API Connection Issues
```bash
# Verify API endpoint
echo $NEXT_PUBLIC_API_BASE_URL

# Test API connectivity
curl https://rishi-next.vercel.app/api/health
```

### VoltBuilder Errors
- Ensure Capacitor version 7.4.2 (exact)
- Check package.json for conflicts
- Verify Android/iOS configurations
- Review VoltBuilder logs for details

## 📝 Version History

### v2.0.0 (Current)
- Fully static, offline-first architecture
- Enhanced service worker with comprehensive caching
- Improved API configuration system
- Optimized bundle size and performance
- Complete PWA capabilities

### v1.0.0
- Initial Capacitor integration
- Basic offline support
- Remote API integration
- Android/iOS platform support

## 🚢 Deployment Checklist

- [ ] Set correct API endpoint in environment
- [ ] Run `./build-native.sh` successfully
- [ ] Verify `release/rishi-capacitor.zip` created
- [ ] Upload to VoltBuilder
- [ ] Test Android APK on device
- [ ] Test iOS app on device (if applicable)
- [ ] Verify offline functionality
- [ ] Check data sync when online
- [ ] Confirm authentication works
- [ ] Test all critical features

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review VoltBuilder logs
3. Verify environment configuration
4. Test API connectivity
5. Contact platform support if needed

---

**Last Updated**: January 2025
**Build System**: v2.0.0
**Status**: Production Ready