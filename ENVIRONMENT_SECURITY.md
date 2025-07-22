# Environment Security & Database Separation

## Overview

This document outlines the strict environment separation implemented to prevent development data from reaching production databases.

## Environment Detection Logic

The system uses a hierarchical environment detection system with fail-safe defaults:

### 1. Explicit Override (Highest Priority)
```bash
FORCE_ENVIRONMENT=development|staging|production
```

### 2. Environment-Specific Detection

#### Development
- `NODE_ENV=development` AND `NEXT_PHASE != phase-production-build`
- Uses: `DEV_DATABASE_URL` or `DATABASE_URL`

#### Staging  
- Replit Autoscale: `REPLIT=1` or `REPLIT_DOMAINS` present
- Explicit staging: `DEPLOY_ENV=staging` or `NEXT_PUBLIC_APP_ENV=staging`
- Uses: `STAGING_DATABASE_URL` or `DATABASE_URL`

#### Production
- Vercel Production: `VERCEL_ENV=production` or `VERCEL=1`
- Explicit production with database: `PRODUCTION_DATABASE_URL` present
- Uses: `PRODUCTION_DATABASE_URL` or `DATABASE_URL`

### 3. Build-Time Safety
- During `NEXT_PHASE=phase-production-build`:
  - Uses **staging** unless `PRODUCTION_DATABASE_URL` is explicitly set
  - This prevents accidental production database access during builds

### 4. Default Fallback
- Unknown scenarios default to **development** (safest option)

## Database URL Priority

1. **Development**: `DEV_DATABASE_URL` → `DATABASE_URL`
2. **Staging**: `STAGING_DATABASE_URL` → `DATABASE_URL`
3. **Production**: `PRODUCTION_DATABASE_URL` → `DATABASE_URL`

## Security Validation

Run the environment validation script:
```bash
node scripts/check-environment-separation.js
```

## Configuration Files

### `.env.development`
```bash
NODE_ENV=development
FORCE_ENVIRONMENT=development
DATABASE_URL=postgresql://dev-database-url
```

### `.env.voltbuilder`
```bash
NODE_ENV=production
FORCE_ENVIRONMENT=production
PRODUCTION_DATABASE_URL=postgresql://prod-database-url
```

## Critical Security Rules

1. **No Development Data in Production**: Development environment is isolated
2. **Explicit Production Access**: Production requires `PRODUCTION_DATABASE_URL`
3. **Fail-Safe Defaults**: Unknown scenarios default to development
4. **Build Safety**: VoltBuilder builds use staging unless explicitly configured for production

## Validation Commands

```bash
# Check environment separation
node scripts/check-environment-separation.js

# Test VoltBuilder build
./scripts/build-for-voltbuilder.sh

# Verify current environment
echo "Current environment detection: $(node -e 'require("./app/api/auth-service/db").getEnvironment()')"
```