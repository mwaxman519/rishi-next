# Rishi Platform - Multi-Environment Architecture

## Overview

This document establishes the proper industry-standard approach for managing development, staging, and production environments for both web and mobile deployments.

### Recent Updates (January 24, 2025)
- **Client-side Environment Detection**: Implemented browser-compatible environment detection using useClientOnly hook
- **Dev Tools Integration**: Added universal dev tools button across all layout types (authenticated/unauthenticated)
- **Layout Architecture Discovery**: Identified and resolved PublicLayout vs TopBar/SidebarLayout structure differences

## Environment Strategy

### 1. Development Environment
**Purpose**: Local development and testing
- **Platform**: Replit workspace
- **Database**: Development Neon database (`rishiapp_dev`)
- **Backend**: Local Next.js server (http://localhost:5000)
- **Environment Variables**: `.env.development`
- **Build Mode**: Next.js development server
- **Mobile Backend**: Points to local development server

### 2. Staging Environment  
**Purpose**: Pre-production testing and client demos
- **Platform**: Replit Autoscale deployment
- **Database**: Staging Neon database (`rishiapp_staging`)
- **Backend**: Replit Autoscale deployment (https://rishi-staging.replit.app)
- **Environment Variables**: `.env.staging`
- **Build Mode**: Next.js production build with staging config
- **Mobile Backend**: Points to Replit Autoscale deployment

### 3. Production Environment
**Purpose**: Live production system
- **Platform**: Vercel production deployment  
- **Database**: Production Neon database (`rishiapp_prod`)
- **Backend**: Vercel production deployment (https://rishi-platform.vercel.app)
- **Environment Variables**: `.env.production`
- **Build Mode**: Next.js production build with production config
- **Mobile Backend**: Points to Vercel production deployment

## Environment Files Structure

### .env.development
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
DATABASE_URL=postgresql://...rishiapp_dev
NEXT_PUBLIC_API_URL=http://localhost:5000
DEBUG_MODE=true
# Dev Tools Configuration
DEV_TOOLS_ENABLED=true
CLIENT_SIDE_ENV_DETECTION=true
```

### .env.staging
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
DATABASE_URL=postgresql://...rishiapp_staging  
NEXT_PUBLIC_API_URL=https://rishi-staging.replit.app
DEBUG_MODE=false
```

### .env.production
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
DATABASE_URL=postgresql://...rishiapp_prod
NEXT_PUBLIC_API_URL=https://rishi-platform.vercel.app
DEBUG_MODE=false
```

## Mobile App Configuration

### Capacitor Environment-Specific Configs

**capacitor.config.development.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.dev',
  appName: 'Rishi Platform Dev',
  webDir: 'out',
  server: {
    url: 'http://172.31.95.98:5000', // Replit network URL
    cleartext: true
  }
};
export default config;
```

**capacitor.config.staging.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.staging',
  appName: 'Rishi Platform Staging',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://rishi-staging.replit.app']
  }
};
export default config;
```

**capacitor.config.production.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://rishi-platform.vercel.app']
  }
};
export default config;
```

## Build Scripts

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 5000",
    "build:staging": "NODE_ENV=production NEXT_PUBLIC_APP_ENV=staging next build",
    "build:prod": "NODE_ENV=production NEXT_PUBLIC_APP_ENV=production next build",
    
    "mobile:dev": "cp capacitor.config.development.ts capacitor.config.ts && npm run build:static && npx cap sync",
    "mobile:staging": "cp capacitor.config.staging.ts capacitor.config.ts && NODE_ENV=staging npm run build:static && npx cap sync",
    "mobile:prod": "cp capacitor.config.production.ts capacitor.config.ts && NODE_ENV=production npm run build:static && npx cap sync",
    
    "mobile:build:dev": "npm run mobile:dev && npx cap build android",
    "mobile:build:staging": "npm run mobile:staging && npx cap build android", 
    "mobile:build:prod": "npm run mobile:prod && npx cap build android"
  }
}
```

## Deployment Strategy

### Web Deployments
1. **Development**: Local Replit workspace
2. **Staging**: Vercel with staging environment variables
3. **Production**: Vercel with production environment variables

### Mobile Deployments
1. **Development Mobile**: VoltBuilder build pointing to Replit development server
2. **Staging Mobile**: VoltBuilder build pointing to Vercel staging deployment
3. **Production Mobile**: VoltBuilder build pointing to Vercel production deployment

## Environment Detection

### Next.js Configuration (next.config.mjs)
```javascript
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

const nextConfig = {
  // Static export only for mobile builds
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,
  
  // Environment-specific configurations
  ...(appEnv === 'development' && {
    reactStrictMode: true,
    devIndicators: { buildActivity: true }
  }),
  
  ...(appEnv === 'staging' && {
    generateEtags: false,
    poweredByHeader: false
  }),
  
  ...(appEnv === 'production' && {
    generateEtags: false,
    poweredByHeader: false,
    compiler: { removeConsole: true }
  })
};

export default nextConfig;
```

## Security Considerations

1. **Environment Isolation**: Each environment has separate databases and API keys
2. **Domain Restrictions**: Mobile apps only allow navigation to their respective backend domains
3. **Debug Mode**: Only enabled in development
4. **Console Logging**: Removed in production builds
5. **API Keys**: Environment-specific secrets managed through deployment platforms

## Development Tools Integration

### Dev Tools Dashboard
- **Route**: `/dev-tools` (development only)
- **Access**: Universal button in both authenticated and unauthenticated layouts
- **Security**: Automatically hidden in staging/production environments

### Environment Detection Features
- **Client-side Detection**: Browser-compatible using useClientOnly hook
- **Layout Awareness**: Works across PublicLayout and TopBar/SidebarLayout structures
- **Debug Logging**: Comprehensive environment state logging for troubleshooting

### Mobile Build Management
- **One-click Builds**: Automated mobile app builds for all environments
- **File Management**: Auto-cleanup of old builds with latest-files-only system
- **Download System**: Integrated package download after build completion

## Benefits of This Architecture

1. **Clear Separation**: Each environment is completely isolated
2. **Industry Standard**: Follows Next.js and Capacitor best practices
3. **Scalable**: Easy to add new environments
4. **Secure**: Proper secret management and environment isolation
5. **Developer Friendly**: Clear build commands and configuration
6. **Client Friendly**: Staging environment for testing and demos
7. **Universal Dev Access**: Dev tools accessible from any application state
8. **Browser Compatible**: Environment detection works reliably across all browsers