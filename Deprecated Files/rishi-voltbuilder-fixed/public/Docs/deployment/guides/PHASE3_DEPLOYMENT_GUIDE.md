# Phase 3: Full Application Azure Deployment Guide

## Overview

Deploy complete Rishi Platform with Next.js standalone build, Azure Functions API routes, and PostgreSQL database integration.

## Pre-Deployment Preparation

### 1. Configuration Files

Copy these production-optimized files to replace current versions:

```bash
cp next.config.azure-production.mjs next.config.mjs
cp package.azure-production.json package.json
cp staticwebapp.azure-production.config.json staticwebapp.config.json
```

### 2. Environment Variables Setup

Configure in Azure Static Web Apps environment:

**Required Secrets:**

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret key (32+ characters)
- `NEXTAUTH_URL` - Production domain URL
- `JWT_SECRET` - JWT signing secret (32+ characters)

**Optional Services:**

- `GOOGLE_MAPS_API_KEY` - For location services
- `SENDGRID_API_KEY` - For email notifications

### 3. Database Schema Deployment

Run database migrations before deployment:

```bash
npm run db:push
```

## Azure Static Web Apps Configuration

### Build Settings

- **App location**: `/`
- **API location**: `app/api`
- **Output location**: `.next` (for standalone build)
- **Node.js Version**: 18.x (specified in package.json engines)

### Build Process

Azure will execute:

1. `npm install` - Install production dependencies with Node.js 18.x
2. `npm run build` - Next.js standalone build with Azure Functions (outputs to .next directory)

### API Routes Conversion

All `/app/api/*` routes automatically convert to Azure Functions with Node.js 18 runtime:

- Authentication: `/api/auth/*`
- Bookings: `/api/bookings/*`
- Staff: `/api/staff/*`
- Organizations: `/api/organizations/*`
- Admin: `/api/admin/*`

## Security Configuration

### Role-Based Access Control

- **super_admin**: Full system access
- **internal_admin**: Organization management
- **internal_field_manager**: Staff and booking management
- **brand_agent**: Event execution and reporting
- **client_manager**: Client organization oversight
- **client_user**: Basic booking and team access

### Security Headers

Production configuration includes:

- Content Security Policy with cannabis industry requirements
- XSS Protection with inline script controls
- Frame Options for embedding security
- HTTPS enforcement with HSTS

## Performance Optimizations

### Bundle Optimization

- Server external packages for database connections
- Code splitting with Azure Function size limits (244KB)
- Static asset caching with CDN distribution
- Image optimization disabled for compatibility

### Database Connection

- Neon PostgreSQL serverless with connection pooling
- EventBusService for audit trails and real-time updates
- CircuitBreakerService for resilient database connections

## Post-Deployment Verification

### Health Checks

1. Verify `/api/health` endpoint responds
2. Test authentication flows
3. Validate database connectivity
4. Check role-based access controls

### Performance Metrics

- Initial page load < 3 seconds
- API response times < 500ms
- Database query optimization
- CDN cache hit rates > 90%

## Cannabis Industry Features

### Booking Management

- 8-stage booking lifecycle with state transitions
- Multi-state territorial filtering
- Staff assignment with cannabis expertise tracking
- Equipment kit management and tracking

### Operational Workflows

- Real-time booking status updates
- Staff availability and scheduling
- Geographic territory management
- Performance analytics and reporting

## Deployment Checklist

- [ ] Production configuration files copied
- [ ] Environment variables configured in Azure
- [ ] Database schema deployed with `db:push`
- [ ] GitHub repository updated with production files
- [ ] Azure Static Web Apps build/deployment settings verified
- [ ] Health check endpoints tested
- [ ] Role-based access controls validated
- [ ] Performance metrics baseline established

## Expected Deployment Time

- Build: 3-5 minutes
- Function deployment: 2-3 minutes
- CDN propagation: 5-10 minutes
- Total: 10-18 minutes

## Post-Deployment URL Structure

- **Application**: `https://[app-name].azurestaticapps.net`
- **API Functions**: `https://[app-name].azurestaticapps.net/api/*`
- **Health Check**: `https://[app-name].azurestaticapps.net/api/health`

## Success Indicators

- Build completes without errors
- All API routes convert to Azure Functions
- Database connections established
- Authentication flows functional
- Role-based navigation working
- Cannabis booking workflows operational
