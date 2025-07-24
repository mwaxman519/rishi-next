# Replit Autoscale Deployment Guide

## Overview
This guide explains how to deploy the Rishi Platform to Replit Autoscale (our staging environment) without encountering build errors.

**IMPORTANT: Azure deployments are completely descoped. Replit Autoscale is our primary deployment target.**

## Problem
Staging builds were failing with this error:
```
[Error: Page "/api/admin/locations/[id]/approve" is missing "generateStaticParams()" so it cannot be used with "output: export" config.]
```

## Solution
The application now automatically detects staging environments and uses server mode instead of static export.

## Environment Configuration

### For Replit Autoscale Deployment (Our Primary Target)
Set these environment variables:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging
DATABASE_URL=your_neon_database_url
```

### For Development
Set these environment variables:
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
DATABASE_URL=your_dev_database_url
```

**Note: Azure and Vercel deployments are descoped. All deployments use Replit Autoscale.**

## Build Configuration Logic

The `next.config.mjs` file now uses this logic:

```javascript
// Server mode for all environments (Azure deployments are descoped)
output: undefined, // Always use server mode for Replit Autoscale
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

1. **Replit Autoscale**: Always uses server mode (supports dynamic API routes and serverless functions)
2. **Development**: Uses server mode (no static export)
3. **Azure Deployments**: Completely descoped - not currently supported
4. **All Environments**: Use server mode for full Next.js functionality

## Troubleshooting

If you encounter build errors:

1. Check that `NEXT_PUBLIC_APP_ENV=staging` is set for Replit Autoscale builds
2. Ensure `DATABASE_URL` is properly configured for your Neon database
3. Run the verification script to confirm configuration
4. Check the build logs for the exact error message

## Dynamic API Routes

These routes require server mode and will fail with static export:
- `/api/admin/locations/[id]/approve`
- `/api/activities/[id]/approve`
- `/api/bookings/[id]/approve`
- And all other routes with `[id]` or dynamic parameters

All deployments use server mode for Replit Autoscale serverless functions.