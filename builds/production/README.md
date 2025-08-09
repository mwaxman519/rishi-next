# Production Mobile App Build

## Overview
Production VoltBuilder package for Rishi Platform mobile app connecting to Vercel production APIs.

## Key Differences from Staging
- **API Base URL**: `https://rishi-platform.vercel.app` (production Vercel deployment)
- **Environment**: Production database and services
- **Build Target**: Production-optimized APK for app store distribution
- **Security**: Enhanced production security headers and authentication

## Build Configuration
- Uses same Capacitor 7.4.2 and gradle wrapper setup as staging
- Static HTML/CSS/JS architecture connecting to Vercel serverless functions
- Production logo and branding assets
- Optimized for app store submission

## Production API Endpoints
- Authentication: `https://rishi-platform.vercel.app/api/auth-service/session`
- Bookings: `https://rishi-platform.vercel.app/api/bookings`
- Staff: `https://rishi-platform.vercel.app/api/staff`
- Locations: `https://rishi-platform.vercel.app/api/locations`
- Inventory: `https://rishi-platform.vercel.app/api/inventory/kits`

Package will be generated as: `rishi-platform-voltbuilder-production.zip`