# Vercel Production Deployment Guide - Rishi Platform

## Prerequisites

### 1. Environment Variables Required

Set these in your Vercel project dashboard:

**Database Configuration:**
- `DATABASE_URL` - Production PostgreSQL connection string
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

**Authentication:**
- `JWT_SECRET` - Secure random string for JWT tokens
- `JWT_REFRESH_SECRET` - Secure random string for refresh tokens

**Application Configuration:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_APP_NAME=Rishi Platform`
- `NEXT_PUBLIC_APP_VERSION=1.0.0`

**Feature Flags:**
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- `NEXT_PUBLIC_ENABLE_MONITORING=true`
- `NEXT_PUBLIC_ENABLE_DEBUG=false`

### 2. Database Setup

Ensure your production database has:
- All 32 tables from the schema
- Super admin user created
- Default "Rishi Internal" organization

## Deployment Steps

### Step 1: Connect to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. In project root: `vercel --prod`

### Step 2: Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables from the list above
3. Ensure they're set for "Production" environment

### Step 3: Deploy

```bash
# Deploy to production
vercel --prod

# Or use GitHub integration (recommended)
# Push to main branch after connecting GitHub repo
```

## Configuration Files

### Key Files for Vercel:
- `next.config.mjs` - Automatically detects Vercel and disables static export
- `vercel.json` - Vercel-specific configuration
- `package.json` - Build scripts (uses `next build`)

### Important Notes:
- **NO static export** for Vercel (API routes need serverless functions)
- TypeScript/ESLint errors will fail the build on Vercel
- Images are optimized by Vercel automatically
- All API routes become serverless functions

## Post-Deployment

### Verify:
1. Application loads at your Vercel URL
2. Authentication works (login with mike/wrench519)
3. Database connection is functional
4. API endpoints respond correctly

### Monitor:
- Check Vercel dashboard for function logs
- Monitor database connections
- Verify performance metrics

## Troubleshooting

### Common Issues:
1. **Build timeout** - Check for circular dependencies or large modules
2. **Database connection** - Verify DATABASE_URL is correct
3. **API routes failing** - Check serverless function logs in Vercel dashboard
4. **TypeScript errors** - Fix all errors (not ignored on Vercel)

### Debug Steps:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check database connection in production

## Current Status

- ✅ Next.js config updated for Vercel
- ✅ Vercel.json configured
- ✅ Environment variables template created
- ⚠️ Missing JWT_REFRESH_SECRET (needs to be set)
- ⚠️ Production database URL needs verification
- ⚠️ TypeScript/ESLint errors may need fixing for build

## Next Steps

1. Set missing JWT_REFRESH_SECRET
2. Fix any TypeScript/ESLint errors
3. Test build locally with Vercel environment
4. Deploy to Vercel
5. Verify all functionality works in production