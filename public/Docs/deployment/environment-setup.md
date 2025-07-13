# Environment Setup - Rishi Platform

## Overview

The Rishi Platform uses a **3-environment architecture** with proper data segregation:

1. **Development** - Local Replit workspace
2. **Staging** - Replit Autoscale (for testing)
3. **Production** - Vercel/Azure (live system)

## Critical Environment Rules

### 🚨 NEVER Mix Environment Databases

- **Development**: Uses separate development database
- **Staging**: Uses separate staging database (NOT production)
- **Production**: Uses production database only

### Environment Variables

Each environment has its own `.env` file:

- `.env.development` - Local development
- `.env.staging` - Replit Autoscale staging
- `.env.production` - Production deployment

## Database Configuration

### Development Environment
```bash
DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_dev?sslmode=require&channel_binding=require
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

### Staging Environment (Replit Autoscale)
```bash
DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require
NODE_ENV=staging
NEXT_PUBLIC_APP_ENV=staging
```

### Production Environment
```bash
DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext?sslmode=require&channel_binding=require
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## Deployment Scripts

### Development
```bash
npm run dev
```

### Staging (Replit Autoscale)
```bash
./deploy-staging.sh build
./deploy-staging.sh start
```

### Production
```bash
./deploy-production.sh build
./deploy-production.sh start
```

## Database Validation

The system includes automatic validation to prevent:
- Staging from using production database
- Cross-environment database contamination
- Accidental production data access in non-production environments

## Environment-Specific Features

### Development
- Mock data enabled
- Debug logging enabled
- Hot reload enabled

### Staging
- Production-like data (staging database)
- Analytics disabled
- Environment banner shown

### Production
- Real production data
- Analytics enabled
- Debug logging disabled
- Performance monitoring enabled