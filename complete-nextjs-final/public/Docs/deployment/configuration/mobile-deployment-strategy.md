# Mobile App Deployment Strategy

## Overview

This document outlines the deployment strategy for our field marketing, support, operations, workforce and event management mobile application, designed to work in harmony with our web application architecture. The strategy ensures consistency across environments and provides a reliable pathway from development to production.

## Architecture

Our field marketing, support, operations, workforce and event management platform consists of a fully serverless architecture:

1. **Web Application**: Next.js app with serverless API routes deployed on Azure Static Web Apps
2. **Mobile Application**: React Native app with online-first, offline-fallback capabilities
3. **Staging Environment**: Replit Autoscale deployment for testing both web and mobile interfaces
4. **Database**: Neon serverless PostgreSQL for production and dedicated serverless database instances for development and staging

```
┌───────────────────────────────────┐  ┌───────────────────────────────────┐
│        Development Environment    │  │        Production Environment      │
│                                   │  │                                    │
│  ┌─────────────┐ ┌─────────────┐  │  │  ┌─────────────┐  ┌─────────────┐ │
│  │ Next.js App │ │ Serverless  │  │  │  │ Next.js App │  │ Serverless  │ │
│  │   (Replit)  │ │ API Routes  │  │  │  │   (Azure)   │  │ API Routes  │ │
│  └─────────────┘ └─────────────┘  │  │  └─────────────┘  └─────────────┘ │
│           │             │         │  │         │               │         │
└───────────┼─────────────┼─────────┘  └─────────┼───────────────┼─────────┘
            │             │                      │               │
            ▼             ▼                      ▼               ▼
    ┌───────────────────────────────┐  ┌───────────────────────────────────┐
    │       Staging Environment     │  │       Serverless Database          │
    │      (Replit Autoscale)       │  │        (Neon Serverless)           │
    └───────────────┬───────────────┘  └────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │          Mobile App           │
    │   (Development/Staging/Prod)  │
    └───────────────────────────────┘
```

## Environments

### 1. Development Environment

- **Web**: Replit development environment running Next.js
- **Mobile**: Local Expo development with connection to either:
  - Local development server (for local testing)
  - Replit development environment (for integrated testing)
- **Database**: Development database on Neon

### 2. Staging Environment

- **Web**: Replit Autoscale deployment
- **Mobile**: Staging build connecting to Replit Autoscale deployment
- **Database**: Staging database on Neon

### 3. Production Environment

- **Web**: Azure Static Web Apps deployment
- **Mobile**: Production builds in app stores
- **Database**: Production database on Neon

## Mobile App Configuration

### Development Configuration

```javascript
// apps/mobile/.env.development
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_ENABLE_LOGGING=true
```

### Staging Configuration

```javascript
// apps/mobile/.env.staging
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_API_URL=https://rishi-staging.repl.co/api
EXPO_PUBLIC_ENABLE_LOGGING=true
```

### Production Configuration

```javascript
// apps/mobile/.env.production
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://app.rishico.com/api
EXPO_PUBLIC_ENABLE_LOGGING=false
```

## Build Profiles

The EAS configuration for different build environments:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging",
        "EXPO_PUBLIC_API_URL": "https://rishi-staging.repl.co/api"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production",
        "EXPO_PUBLIC_API_URL": "https://app.rishico.com/api"
      }
    }
  }
}
```

## Deployment Process

### Phase 1: Development Testing

1. Develop in local environment or Replit
2. Test mobile app with local backend:
   ```bash
   cd apps/mobile
   npx expo start
   ```

### Phase 2: Staging Deployment

1. Deploy web app to Replit Autoscale
2. Build mobile app with staging configuration:
   ```bash
   cd apps/mobile
   npx eas build --profile staging --platform android
   # Or for iOS
   npx eas build --profile staging --platform ios
   ```
3. Test on real devices with staging backend
4. Verify online-offline functionality
5. Test synchronization capabilities

### Phase 3: Production Deployment

1. Deploy web app to Azure Static Web Apps
2. Build production-ready mobile app:
   ```bash
   cd apps/mobile
   npx eas build --profile production --platform all
   ```
3. Submit to app stores or distribute internally

## Testing Strategy

### Online-Offline Testing

1. **Online Testing**:

   - Connect to backend API
   - Perform CRUD operations
   - Test authentication flows

2. **Offline Testing**:

   - Put device in airplane mode
   - Perform the same operations
   - Verify data is stored locally

3. **Synchronization Testing**:
   - Create data while offline
   - Restore connectivity
   - Verify data is synchronized
   - Test conflict resolution if conflicts occur

### Device Feature Testing

1. **Camera Integration**:

   - Test photo capture
   - Test image uploads when online
   - Verify image storage when offline

2. **Location Services**:
   - Test location tracking
   - Verify location data storage
   - Test location-based features

## Monitoring and Analytics

1. **Error Tracking**:

   - Integrate Sentry or similar for error reporting
   - Configure different DSNs for different environments

2. **Usage Analytics**:

   - Firebase Analytics or similar
   - Track key user journeys
   - Monitor performance metrics

3. **Crash Reporting**:
   - Automatic crash reporting
   - Symbolicated stack traces

## White Labeling Strategy

The mobile app supports white labeling for partner organizations:

1. **Configuration-Based**:

   - App name, icons, and splash screens
   - Brand colors and typography
   - Contact information

2. **Implementation**:
   - Separate app configurations for each partner
   - Shared codebase with partner-specific configuration
   - Dynamic loading of assets based on configuration

## Release Management

### Version Control

- Semantic versioning (MAJOR.MINOR.PATCH)
- Release branches for major versions
- Hotfix branches for critical fixes

### Release Cadence

- Web: Continuous deployment to staging, scheduled releases to production
- Mobile: 2-4 week release cycle, with hotfixes as needed

## Security Considerations

1. **Authentication**:

   - Secure token storage
   - Biometric authentication option
   - Automatic logout after inactivity

2. **Data Protection**:

   - Encryption of sensitive data at rest
   - Secure offline storage
   - Compliant with industry regulations

3. **Network Security**:
   - HTTPS for all API communications
   - Certificate pinning
   - Protection against MITM attacks

## Next Steps

1. **Complete Staging Setup**:

   - Finalize Replit Autoscale deployment
   - Configure mobile app for staging

2. **Implement Testing Pipeline**:

   - Automated testing for API endpoints
   - E2E testing for critical workflows

3. **Distribution Setup**:

   - Create app store accounts
   - Prepare store listings and screenshots

4. **Monitoring Implementation**:
   - Set up error tracking
   - Configure analytics
   - Create monitoring dashboard
