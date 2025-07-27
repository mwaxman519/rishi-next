# Rishi Platform Mobile App Deployment Guide

## Overview

This guide covers the complete mobile deployment strategy for the Rishi Platform using Capacitor wrapper and VoltBuilder cloud compilation service.

## Architecture

### Deployment Environments

1. **Development** - Local Replit workspace (web only)
   - Database: Replit development database
   - Purpose: Local development and testing

2. **Staging Mobile** - VoltBuilder + Replit Autoscale backend
   - Database: Neon staging database
   - Backend: https://rishi-staging.replit.app
   - App ID: com.rishiplatform.staging

3. **Production Mobile** - VoltBuilder + Vercel backend
   - Database: Neon production database
   - Backend: https://rishi-platform.vercel.app
   - App ID: com.rishiplatform.app

### Environment Separation

- **CRITICAL**: Development database is never used for mobile builds
- Each environment has its own Neon PostgreSQL database
- Complete isolation between environments

## Prerequisites

### Required Environment Variables

#### For Staging Mobile Builds:
```bash
export STAGING_DATABASE_URL="postgresql://neondb_owner:password@ep-staging.neon.tech/rishiapp_staging?sslmode=require"
export NEXTAUTH_SECRET="staging-auth-secret-key"
```

#### For Production Mobile Builds:
```bash
export PRODUCTION_DATABASE_URL="postgresql://neondb_owner:password@ep-production.neon.tech/rishiapp_prod?sslmode=require"
export NEXTAUTH_SECRET="production-auth-secret-key"
```

### VoltBuilder Account
- Sign up at https://voltbuilder.com/
- Cost: $15/month subscription
- Supports both Android and iOS compilation

## Building Mobile Apps

### 1. Staging Mobile Build

```bash
# Set staging environment variables
export STAGING_DATABASE_URL="your-staging-database-url"
export NEXTAUTH_SECRET="your-staging-secret"

# Run staging build script
chmod +x scripts/build-mobile-staging.sh
./scripts/build-mobile-staging.sh
```

This creates: `rishi-mobile-staging-YYYY-MM-DD-HHMM.zip`

### 2. Production Mobile Build

```bash
# Set production environment variables
export PRODUCTION_DATABASE_URL="your-production-database-url"
export NEXTAUTH_SECRET="your-production-secret"

# Run production build script
chmod +x scripts/build-mobile-production.sh
./scripts/build-mobile-production.sh
```

This creates: `rishi-mobile-production-YYYY-MM-DD-HHMM.zip`

## VoltBuilder Deployment

### 1. Upload Package
1. Go to https://voltbuilder.com/
2. Upload the generated zip file
3. Select target platforms (Android/iOS)

### 2. Configuration
- **Android Package Name**: 
  - Staging: `com.rishiplatform.staging`
  - Production: `com.rishiplatform.app`
- **iOS Bundle ID**: Same as Android package name
- **App Name**:
  - Staging: "Rishi Platform (Staging)"
  - Production: "Rishi Platform"

### 3. Compilation
- VoltBuilder compiles to native APK (Android) and IPA (iOS)
- Download compiled app files
- Test on devices

## App Distribution

### Development/Testing
- **Firebase App Distribution**: Direct installation for team testing
- **TestFlight** (iOS): Internal testing distribution
- **Internal Distribution**: Direct APK installation for Android

### Production Release
- **Google Play Store**: Android production release
- **Apple App Store**: iOS production release
- Requires developer accounts ($25/year Google, $99/year Apple)

## App Features

### Native Capabilities
- **Offline Support**: Full app functionality without internet
- **Push Notifications**: Real-time alerts and updates
- **Device Integration**: Camera, GPS, contacts access
- **Local Storage**: Cached data for offline use
- **Background Sync**: Data synchronization when online

### Security Features
- **Secure Storage**: Encrypted local data storage
- **Certificate Pinning**: API communication security
- **Biometric Authentication**: Fingerprint/face recognition
- **App Transport Security**: Enforced HTTPS connections

## Backend Integration

### API Communication
- **Staging**: Mobile app → https://rishi-staging.replit.app/api/*
- **Production**: Mobile app → https://rishi-platform.vercel.app/api/*

### Database Access
- Mobile apps connect to respective Neon databases
- No direct database connections (API-only)
- Proper environment isolation maintained

## Troubleshooting

### Common Issues

#### Build Failures
- Verify environment variables are set
- Check database connectivity
- Ensure all dependencies are installed

#### VoltBuilder Errors
- Validate Capacitor configuration
- Check Android/iOS resource files
- Verify package names and bundle IDs

#### App Crashes
- Check API endpoint connectivity
- Verify authentication configuration
- Test offline functionality

### Debug Steps
1. Verify environment variable configuration
2. Test API endpoints manually
3. Check mobile build logs
4. Validate Capacitor setup
5. Test on multiple devices

## Cost Structure

### VoltBuilder
- **Monthly Subscription**: $15/month
- **Unlimited Builds**: No build limits
- **Platform Support**: Android + iOS

### App Store Fees
- **Google Play**: $25 one-time registration
- **Apple Developer**: $99/year subscription

### Infrastructure
- **Neon Database**: Included in existing plan
- **Vercel/Replit**: Existing hosting costs
- **Firebase**: Free tier sufficient for distribution

## Security Considerations

### Environment Isolation
- Development database never exposed to mobile builds
- Staging and production completely separated
- API keys and secrets environment-specific

### Mobile Security
- All API communication over HTTPS
- Local data encrypted
- Secure authentication token storage
- Certificate pinning for API calls

## Maintenance

### Regular Updates
- Update mobile packages monthly
- Sync with web platform features
- Security patch deployment
- Performance optimizations

### Monitoring
- App crash reporting
- Performance metrics
- User analytics
- API usage monitoring

## Next Steps

1. Set up staging and production Neon databases
2. Configure environment variables
3. Run staging mobile build
4. Test staging app on devices
5. Deploy production mobile build
6. Submit to app stores

For questions or issues, refer to the main Rishi Platform documentation or contact the development team.