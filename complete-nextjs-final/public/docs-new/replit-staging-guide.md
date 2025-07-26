# Replit Staging Deployment Guide

This document provides instructions for setting up and using Replit as a staging environment before deploying to Azure Static Web Apps in production.

## Overview

Replit serves as our staging environment for testing the full application stack including:

- Next.js production build with server-side rendering
- Middleware functionality
- Database connectivity
- API endpoints
- Authentication flows

## Prerequisites

1. A Replit account with access to the project
2. PostgreSQL database connection string (stored in environment variables)
3. JWT secret for authentication (optional but recommended)

## Deployment Steps

### 1. Set Environment Variables

Ensure the following environment variables are set in your Replit project:

- `DATABASE_URL`: Connection string to your PostgreSQL database
- `JWT_SECRET`: Secret key for JWT token generation/validation

To set these variables:

1. Click on "Secrets" in the Replit sidebar
2. Add each key-value pair
3. These will be available in your application at runtime

### 2. Run the Staging Deployment Script

Our enhanced deployment script (`replit-deploy.sh`) performs several checks before building:

```bash
bash replit-deploy.sh
```

This script:

- Verifies database connectivity
- Checks middleware configuration
- Runs TypeScript type checking
- Optimizes Next.js config for Replit
- Builds the application with memory optimization

### 3. Deploy via Replit

After the build completes successfully:

1. Click the "Deploy" button in the Replit interface
2. Configure the deployment with:
   - Start command: `node .next/standalone/server.js`
   - Ensure environment variables are configured

### 4. Verify Staging Deployment

Once deployed, test the following:

- ✅ All routes load without ChunkLoadError issues
- ✅ Database operations work correctly
- ✅ Middleware functionality (auth, redirects) works
- ✅ API endpoints function properly

## Troubleshooting

### Database Connectivity Issues

If you encounter database connection problems:

1. Verify `DATABASE_URL` is set correctly in environment variables
2. Run `node verify-database.js` to see detailed error messages
3. Check if the database is accessible from Replit's IP range

### ChunkLoadError Issues

If chunk loading errors occur:

1. The deployment script already implements webpack optimizations
2. Try navigating to different routes to see if the issue is route-specific
3. Clear your browser cache or try in incognito mode

### Middleware Problems

If middleware isn't working:

1. Check middleware.ts for errors
2. Verify that `output: 'export'` is not in your next.config.mjs
3. Set `DISABLE_MIDDLEWARE=1` in environment variables to test without middleware

## Moving to Production

Once testing confirms everything works in the Replit staging environment:

1. Create a GitHub Actions workflow for Azure Static Web Apps deployment
2. Configure the same environment variables in Azure
3. Deploy to production

The staging-verified application should deploy to production without issues.

## References

- [Replit Deployments Documentation](https://docs.replit.com/hosting/deployments/about-deployments)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Azure Static Web Apps Next.js Guide](https://docs.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs)
