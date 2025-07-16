# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Rishi Platform across different environments. The platform supports multiple deployment strategies to meet various organizational needs.

## Deployment Strategies

### Environment Architecture
The Rishi Platform uses a three-tier environment structure:

1. **Development** - Local development environment
2. **Staging** - Pre-production testing environment  
3. **Production** - Live production environment

### Deployment Options
- **Vercel** - Recommended for Next.js applications
- **Azure Static Web Apps** - Enterprise-grade hosting
- **Replit Autoscale** - Development and staging environments
- **Self-Hosted** - On-premises deployment

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository access
- Environment variables configured
- Database connection string

### Deployment Steps

1. **Connect Repository**
   ```bash
   # Connect your GitHub repository to Vercel
   vercel --prod
   ```

2. **Configure Environment Variables**
   ```bash
   # Set required environment variables
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

3. **Build Configuration**
   ```javascript
   // next.config.mjs
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     experimental: {
       serverActions: true
     }
   };
   ```

4. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

### Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

## Azure Static Web Apps

### Prerequisites
- Azure subscription
- Azure CLI installed
- GitHub repository access
- Resource group created

### Deployment Steps

1. **Create Static Web App**
   ```bash
   # Create Azure Static Web App
   az staticwebapp create \
     --name rishi-platform \
     --resource-group rishi-rg \
     --source https://github.com/your-org/rishi-platform \
     --location "West US 2" \
     --branch main \
     --app-location "/" \
     --api-location "api" \
     --output-location "out"
   ```

2. **Configure Build Settings**
   ```yaml
   # .github/workflows/azure-static-web-apps.yml
   name: Azure Static Web Apps CI/CD
   
   on:
     push:
       branches: [ main ]
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches: [ main ]
   
   jobs:
     build_and_deploy_job:
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v3
         - name: Build And Deploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/"
             api_location: ""
             output_location: "out"
   ```

3. **Environment Configuration**
   ```bash
   # Set environment variables in Azure
   az staticwebapp appsettings set \
     --name rishi-platform \
     --setting-names DATABASE_URL=your-database-url \
     NEXTAUTH_SECRET=your-secret \
     NEXTAUTH_URL=https://your-app.azurestaticapps.net
   ```

## Replit Deployment

### Replit Autoscale
For development and staging environments:

1. **Configure Replit**
   ```bash
   # .replit
   run = "npm run dev"
   
   [env]
   NODE_ENV = "development"
   DATABASE_URL = "your-replit-database-url"
   ```

2. **Deploy to Autoscale**
   ```bash
   # Deploy to Replit Autoscale
   replit deploy
   ```

### Environment Variables
```bash
# Set in Replit Secrets
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-repl.replit.app"
```

## Database Deployment

### Neon PostgreSQL
Recommended database solution for production:

1. **Create Database**
   ```bash
   # Create Neon database
   neon db create rishi-platform-prod
   ```

2. **Configure Connection**
   ```javascript
   // db.ts
   import { neonConfig } from '@neondatabase/serverless';
   import { drizzle } from 'drizzle-orm/neon-serverless';
   
   neonConfig.webSocketConstructor = ws;
   
   export const db = drizzle(process.env.DATABASE_URL);
   ```

3. **Run Migrations**
   ```bash
   # Apply database migrations
   npm run db:migrate
   ```

### Environment-Specific Databases
- **Development**: Replit built-in database
- **Staging**: Neon staging database
- **Production**: Neon production database

## Mobile App Deployment

### VoltBuilder Configuration
For native mobile apps:

1. **Prepare Build**
   ```bash
   # Build for mobile
   npm run build:mobile
   ```

2. **VoltBuilder Package**
   ```javascript
   // voltbuilder.config.js
   module.exports = {
     appId: 'com.rishi.platform',
     appName: 'Rishi Platform',
     version: '1.0.0',
     platforms: ['android', 'ios']
   };
   ```

3. **Firebase Distribution**
   ```bash
   # Upload to Firebase App Distribution
   firebase appdistribution:distribute app-debug.apk \
     --app 1:123456789:android:abcdef \
     --groups "testers"
   ```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Environment Configuration

### Production Environment Variables
```bash
# Required production variables
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-production-domain.com
GOOGLE_MAPS_API_KEY=your-api-key
```

### Staging Environment Variables
```bash
# Required staging variables
NODE_ENV=staging
DATABASE_URL=postgresql://staging-database-url
NEXTAUTH_SECRET=your-staging-secret
NEXTAUTH_URL=https://your-staging-domain.com
```

### Development Environment Variables
```bash
# Required development variables
NODE_ENV=development
DATABASE_URL=postgresql://dev-database-url
NEXTAUTH_SECRET=your-dev-secret
NEXTAUTH_URL=http://localhost:3000
```

## Security Configuration

### SSL/TLS Setup
- **Production**: Automatic SSL through deployment platform
- **Custom Domain**: Configure SSL certificates
- **Security Headers**: Configure security headers

### Environment Security
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## Monitoring and Logging

### Application Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **User Analytics**: Usage pattern analysis
- **System Metrics**: Resource utilization monitoring

### Log Management
```javascript
// logging.js
export const logger = {
  info: (message, metadata) => {
    console.log(`[INFO] ${message}`, metadata);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, metadata) => {
    console.warn(`[WARN] ${message}`, metadata);
  }
};
```

## Backup and Recovery

### Database Backups
- **Automated Backups**: Daily automated backups
- **Point-in-Time Recovery**: Restore to specific timestamp
- **Cross-Region Backups**: Backup replication
- **Backup Testing**: Regular backup restoration testing

### Disaster Recovery
```bash
# Backup procedure
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore procedure
psql $DATABASE_URL < backup_file.sql
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.mjs
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true
  }
};
```

### Runtime Optimization
- **Caching Strategy**: Multi-level caching
- **CDN Configuration**: Global content delivery
- **Database Optimization**: Query optimization
- **Image Optimization**: Responsive image delivery

## Troubleshooting

### Common Issues
- **Build Failures**: Check build logs and dependencies
- **Database Connections**: Verify connection strings
- **Environment Variables**: Ensure all required variables are set
- **SSL Issues**: Check certificate configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run start

# Check deployment status
vercel logs --follow
```

## Best Practices

### Deployment Best Practices
- **Feature Flags**: Use feature flags for gradual rollouts
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Strategy**: Quick rollback procedures
- **Health Checks**: Automated health monitoring

### Security Best Practices
- **Secrets Management**: Secure secret storage
- **Access Control**: Limited deployment access
- **Audit Logging**: Comprehensive deployment logs
- **Vulnerability Scanning**: Regular security scans

For detailed environment-specific deployment instructions, see:
- [Azure Deployment Guide](azure/README.md)
- [Environment Setup](environment-setup.md)
- [Configuration Guide](configuration/README.md)