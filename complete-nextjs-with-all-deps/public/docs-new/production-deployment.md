# Next.js Production Deployment Guide

This guide provides comprehensive instructions for deploying the Next.js application to production environments.

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

1. ✅ Run comprehensive TypeScript checks:

   ```bash
   ./check-types.sh
   ```

2. ✅ Verify database connectivity:

   ```bash
   node verify-database.js
   ```

3. ✅ Verify middleware compatibility:

   ```bash
   ./verify-middleware.sh
   ```

4. ✅ Run the production build with checks:

   ```bash
   ./production-build-with-checks.sh
   ```

5. ✅ Review environment variables:

   - Ensure all required variables are configured
   - Verify sensitive variables are properly secured

6. ✅ Check for outdated dependencies with security issues:
   ```bash
   npm audit
   ```

## Production Build Optimization

### Memory Optimization

For memory-constrained environments, adjust Node.js memory settings:

```bash
export NODE_OPTIONS="--max-old-space-size=3072"
```

The `production-build-with-checks.sh` script includes this optimization.

### Build Performance

To optimize build times:

1. Enable output caching in `next.config.mjs`:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // ... other settings
     experimental: {
       outputFileTracingExcludes: {
         "*": [
           "node_modules/@swc/core-linux-x64-gnu",
           "node_modules/@swc/core-linux-x64-musl",
           "node_modules/@esbuild/darwin-x64",
           // Add other platform-specific exclusions here
         ],
       },
     },
   };
   ```

2. Optimize image handling:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // ... other settings
     images: {
       minimumCacheTTL: 60,
       formats: ["image/webp"],
     },
   };
   ```

### Bundle Size Optimization

1. Enable bundle analysis in `next.config.mjs`:

   ```javascript
   const withBundleAnalyzer = require("@next/bundle-analyzer")({
     enabled: process.env.ANALYZE === "true",
   });

   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // ... other settings
   };

   module.exports = withBundleAnalyzer(nextConfig);
   ```

2. Run the analysis:

   ```bash
   ANALYZE=true npm run build
   ```

3. Identify and fix large dependencies or code splitting issues

## Deployment Targets

### Replit Deployment

To deploy the application on Replit:

1. Use the script provided by Replit:

   ```bash
   ./replit-deploy.sh
   ```

2. This script handles:
   - Production build
   - Optimization for the Replit environment
   - Configuration of environment variables
   - Starting the production server

### Azure Static Web Apps

For Azure Static Web Apps deployment:

1. Ensure `staticwebapp.config.json` is properly configured:

   ```json
   {
     "routes": [
       {
         "route": "/api/*",
         "methods": ["GET", "POST", "PUT", "DELETE"],
         "allowedRoles": ["authenticated"]
       },
       {
         "route": "/*",
         "serve": "/index.html",
         "statusCode": 200
       }
     ],
     "navigationFallback": {
       "rewrite": "/index.html",
       "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
     },
     "responseOverrides": {
       "404": {
         "rewrite": "/404.html",
         "statusCode": 404
       }
     }
   }
   ```

2. Use a CI/CD pipeline with GitHub Actions:

   ```yaml
   name: Azure Static Web Apps CI/CD

   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main

   jobs:
     build_and_deploy_job:
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v2
         - name: Build And Deploy
           id: builddeploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             app_location: "/"
             api_location: "api"
             output_location: ".next"
             app_build_command: "npm run build:production"
   ```

### Standalone Server

To deploy as a standalone Node.js server:

1. Build with standalone output:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // ... other settings
     output: "standalone",
   };
   ```

2. Run the build:

   ```bash
   npm run build
   ```

3. Deploy the `.next` folder and the following files:

   - `public/` folder
   - `package.json`
   - `.next/standalone/` (if using standalone output)
   - Environment variables configuration

4. Start the server:
   ```bash
   npm run start
   ```

## Middleware Considerations

### Middleware Compatibility

If using middleware, ensure:

1. The `output` setting in `next.config.mjs` is NOT set to `'export'`
2. The deployment target supports middleware execution
3. Run the middleware verification script before deployment:
   ```bash
   ./verify-middleware.sh
   ```

### Environment-Specific Middleware

For environments where middleware should be disabled:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Skip middleware in specific environments
  if (process.env.DISABLE_MIDDLEWARE === "true") {
    return NextResponse.next();
  }

  // Middleware logic
  // ...
}
```

## Database Configuration

### Connection Pooling

For production environments, configure connection pooling:

```typescript
// server/db.ts
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

// Configure connection pooling for production
if (process.env.NODE_ENV === "production") {
  neonConfig.fetchConnectionCache = true;
  neonConfig.useSecureWebSocket = true;
}

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Database Verification

Always verify database connectivity before starting the production server:

```bash
node verify-database.js
```

This is included in the `production-build-with-checks.sh` script.

## Monitoring and Logging

### Error Tracking

Implement error tracking with services like Sentry:

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Performance Monitoring

Implement Web Vitals monitoring:

```typescript
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (process.env.NODE_ENV === "production") {
    // Send to analytics
    console.log(metric);
  }
}
```

## Security Best Practices

1. **Content Security Policy**: Implement CSP headers in the middleware:

   ```typescript
   export function middleware(request: NextRequest) {
     const response = NextResponse.next();

     // Add CSP header
     response.headers.set(
       "Content-Security-Policy",
       "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
     );

     return response;
   }
   ```

2. **Environment Variables**: Ensure sensitive information is only available server-side:

   - Client-side environment variables must be prefixed with `NEXT_PUBLIC_`
   - Use `.env.production` for production-specific variables
   - Keep API keys and secrets secure

3. **Regular Updates**: Keep dependencies updated to patch security vulnerabilities:
   ```bash
   npm audit fix
   ```

## Troubleshooting Common Deployment Issues

### ChunkLoadError

If you encounter "ChunkLoadError: Loading chunk X failed":

1. Check if you're using dynamic imports correctly
2. Ensure proper configuration for code splitting:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // ... other settings
     experimental: {
       optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
     },
   };
   ```

3. If issues persist, try disabling chunking for problematic modules:
   ```javascript
   const nextConfig = {
     webpack: (config, { dev, isServer }) => {
       if (!dev && !isServer) {
         // Replace granular chunks with the entire package for problematic libraries
         config.optimization.splitChunks.cacheGroups.problematicLib = {
           test: /[\\/]node_modules[\\/](problematic-lib)[\\/]/,
           name: "problematic-lib",
           priority: 10,
           chunks: "all",
         };
       }
       return config;
     },
   };
   ```

### TypeScript Build Errors

If TypeScript errors occur during build:

1. Run the TypeScript checker:

   ```bash
   ./check-types.sh
   ```

2. Fix type errors in the codebase
3. Ensure consistent TypeScript version between development and CI/CD

### Database Connection Issues

If database connection fails in production:

1. Verify the `DATABASE_URL` environment variable
2. Check network connectivity and firewall settings
3. Ensure the database server allows connections from the deployment environment
4. Run database verification:
   ```bash
   node verify-database.js
   ```

## Continuous Deployment

### GitHub Actions

Example GitHub Actions workflow for CI/CD:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: ./check-types.sh

      - name: Build
        run: npm run build
        env:
          NODE_OPTIONS: "--max-old-space-size=3072"
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Run Tests
        run: npm test

      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          # Deployment script
          echo "Deploying to production..."
```

### Vercel Integration

For Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure build settings:

   - Build Command: `npm run build:production`
   - Install Command: `npm ci`
   - Output Directory: `.next`

3. Configure environment variables in the Vercel dashboard
