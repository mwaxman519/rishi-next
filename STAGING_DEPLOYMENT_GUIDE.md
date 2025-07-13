# STAGING DEPLOYMENT GUIDE

## Issue Fixed
The staging autoscale deployment was failing because:
1. `NODE_ENV=staging` should be `NODE_ENV=production` for Next.js builds
2. Static export configuration was enabled, but Replit Autoscale needs serverless functions
3. API routes cannot be statically exported

## Changes Made
1. Updated `.env.staging` to use `NODE_ENV=production` (required for Next.js builds)
2. Kept `NEXT_PUBLIC_APP_ENV=staging` (for app-level environment detection)
3. Disabled static export for Replit Autoscale in `next.config.mjs`
4. Added `REPLIT` environment detection to config

## Environment Strategy
- **Development**: `NODE_ENV=development`, `NEXT_PUBLIC_APP_ENV=development`
- **Staging**: `NODE_ENV=production`, `NEXT_PUBLIC_APP_ENV=staging` (Replit Autoscale)
- **Production**: `NODE_ENV=production`, `NEXT_PUBLIC_APP_ENV=production` (Vercel/Azure)

## Static Export Strategy
- Only use `output: 'export'` for Azure Static Web Apps
- Never use static export for Vercel or Replit Autoscale (they need serverless functions)
- API routes require serverless function support

## Next Steps
1. Deploy to staging again - should work now
2. Test authentication in staging environment
3. Verify API routes work properly

Date: $(date)