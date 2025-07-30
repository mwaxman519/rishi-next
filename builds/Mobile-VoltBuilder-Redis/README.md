# VoltBuilder Mobile Deployment Packages - Redis Architecture

## Package Information

### Staging Package
- **File**: `rishi-mobile-staging-redis-20250729-2251.zip` (3.2M)
- **App ID**: `com.rishiplatform.staging`
- **Backend**: https://rishi-staging.replit.app
- **Redis**: Replit Redis Cloud (`events:staging:*`)
- **Status**: Ready for VoltBuilder upload

### Production Package  
- **File**: `rishi-mobile-production-redis-20250730-0014.zip` (3.2M)
- **App ID**: `com.rishiplatform.app`
- **Backend**: https://rishi-platform.vercel.app
- **Redis**: Upstash Redis (`events:production:*`)
- **Status**: Requires Upstash credentials configuration

## Deployment Instructions

1. Upload staging package to https://voltbuilder.com/
2. Configure VoltBuilder with Android SDK 33/34 settings
3. Test staging build with Replit Redis Cloud integration
4. Configure production Upstash credentials for production build
5. Deploy production package for app store distribution

## Architecture Features

- Dual Redis event coordination with environment isolation
- Capacitor 7.4.2 native mobile wrapper
- Complete Android Gradle project structure
- Real-time synchronization between mobile and backend
- Environment-specific configurations and database connections

Built: January 29-30, 2025