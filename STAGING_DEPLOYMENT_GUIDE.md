# Staging Deployment Guide - Replit Autoscale Static Web App

## Overview
This guide covers deploying the Rishi Platform to Replit Autoscale as a static web app for staging purposes.

## Prerequisites
- Staging database configured (rishinext_staging)
- Environment variables properly set in .env.staging
- Static export configuration in place

## Build Process

### 1. Build Static Export
```bash
./build-staging.sh
```

This script will:
- Load staging environment variables
- Validate database configuration (prevents production database usage)
- Run database migrations for staging
- Build static export using `next.config.staging.mjs`
- Generate files in `/out` directory

### 2. Deploy to Replit Autoscale

#### Method 1: Using Replit UI
1. Go to your Replit project
2. Click "Deploy" button
3. Select "Autoscale" 
4. Choose "Static Site" deployment type
5. Set build command: `./build-staging.sh`
6. Set publish directory: `out`
7. Deploy

#### Method 2: Using Command Line
```bash
# Build first
./build-staging.sh

# Then deploy using deploy-staging.sh
./deploy-staging.sh build
```

## Configuration Files

### Environment Configuration
- **File**: `.env.staging`
- **Database**: `rishinext_staging` (separate from production)
- **Environment**: `NODE_ENV=staging`
- **Static Export**: `STATIC_EXPORT=1`

### Next.js Configuration
- **File**: `next.config.staging.mjs`
- **Output**: `export` (static export)
- **Images**: `unoptimized: true`
- **Build Optimizations**: Webpack chunks limited to 244KB

### Build Scripts
- **`build-staging.sh`**: Complete staging build with validation
- **`deploy-staging.sh`**: Deployment wrapper script
- **`package.json.staging`**: Staging-specific dependencies

## Validation Checks

### Database Validation
The build process includes critical validation:
- ✅ Ensures staging database URL is used (not production)
- ✅ Prevents accidental production database usage
- ✅ Validates all required environment variables

### Build Validation
- ✅ Static export generates `/out` directory
- ✅ HTML, JS, CSS files properly generated
- ✅ No server-side dependencies in build

## Expected Output Structure
```
out/
├── index.html
├── dashboard.html
├── _next/
│   ├── static/
│   └── data/
├── assets/
└── api/ (if using API routes)
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `.env.staging` has correct staging database URL
   - Ensure database credentials are valid
   - Verify database exists and is accessible

2. **Build Failures**
   - Check TypeScript/ESLint errors (should be ignored in staging)
   - Verify all dependencies are installed
   - Check webpack configuration

3. **Static Export Issues**
   - Ensure `output: 'export'` is set in Next.js config
   - Check that dynamic routes are properly configured
   - Verify image optimization is disabled

### Debug Commands
```bash
# Check environment variables
cat .env.staging

# Verify database connection
npm run db:push

# Test build manually
NODE_ENV=staging STATIC_EXPORT=1 npm run build

# Check build output
ls -la out/
```

## Security Notes
- Staging uses separate database (rishinext_staging)
- JWT secrets are different from production
- Debug mode enabled for troubleshooting
- Analytics disabled in staging

## Deployment URLs
- **Staging**: Will be assigned by Replit Autoscale
- **Environment Banner**: Shows "STAGING" to distinguish from production
- **Database**: Completely separate from production data

## Next Steps After Deployment
1. Verify staging site loads correctly
2. Test key functionality (login, navigation, database operations)
3. Check staging environment banner appears
4. Validate database isolation (no production data visible)
5. Test static export features work properly

## Support
For issues with staging deployment, check:
1. Build logs in `/out` directory
2. Environment variable validation
3. Database connection status
4. Static export configuration