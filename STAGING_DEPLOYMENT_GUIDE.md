# Staging Deployment Guide

## Overview
This guide explains how to deploy the Rishi Platform to staging environments without encountering the static export build errors.

## Problem
Staging builds were failing with this error:
```
[Error: Page "/api/admin/locations/[id]/approve" is missing "generateStaticParams()" so it cannot be used with "output: export" config.]
```

## Solution
The application now automatically detects staging environments and uses server mode instead of static export.

## Environment Configuration

### For Staging Deployment
Set these environment variables:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
# Do NOT set AZURE_STATIC_WEB_APPS_API_TOKEN for staging
```

### For Production (Azure Static Web Apps)
Set these environment variables:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
AZURE_STATIC_WEB_APPS_API_TOKEN=your_token_here
```

### For Production (Vercel)
Set these environment variables:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
VERCEL=1
# Do NOT set AZURE_STATIC_WEB_APPS_API_TOKEN for Vercel
```

## Build Configuration Logic

The `next.config.mjs` file now uses this logic:

```javascript
// Static export only for Azure Static Web Apps AND not staging environment
output: (process.env.AZURE_STATIC_WEB_APPS_API_TOKEN && process.env.NEXT_PUBLIC_APP_ENV !== 'staging') ? 'export' : undefined,
```

## Verification

Run the verification script to test your environment configuration:

```bash
node scripts/verify-build-config.js
```

## Testing Staging Build

Use the staging build test script:

```bash
./scripts/staging-build-test.sh
```

## Key Points

1. **Staging Environment**: Always uses server mode (supports dynamic API routes)
2. **Azure Production**: Uses static export only when both `AZURE_STATIC_WEB_APPS_API_TOKEN` is set and `NEXT_PUBLIC_APP_ENV` is not "staging"
3. **Vercel Production**: Always uses server mode (Vercel handles optimization)
4. **Development**: Uses server mode (no static export)

## Troubleshooting

If you encounter build errors:

1. Check that `NEXT_PUBLIC_APP_ENV=staging` is set for staging builds
2. Ensure `AZURE_STATIC_WEB_APPS_API_TOKEN` is not set for staging
3. Run the verification script to confirm configuration
4. Check the build logs for the exact error message

## Dynamic API Routes

These routes require server mode and will fail with static export:
- `/api/admin/locations/[id]/approve`
- `/api/activities/[id]/approve`
- `/api/bookings/[id]/approve`
- And all other routes with `[id]` or dynamic parameters

Static export is only suitable for Azure Static Web Apps in production where API routes are handled by Azure Functions.