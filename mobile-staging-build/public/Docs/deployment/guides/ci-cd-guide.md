# CI/CD and Deployment Best Practices

## Overview

This document outlines best practices for continuous integration, continuous deployment, and production deployment of the Next.js application.

## Continuous Integration

Implementing a robust CI pipeline can help catch issues early in the development process.

### Recommended CI Steps

1. **Linting and Type Checking**

   ```yaml
   # Example GitHub Actions step
   - name: Type check
     run: npx tsc --noEmit

   - name: Lint
     run: npx next lint
   ```

2. **Unit and Integration Tests**

   ```yaml
   - name: Run tests
     run: npm test
   ```

3. **Build Verification**

   ```yaml
   - name: Verify build
     run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

4. **Database Migration Testing**
   ```yaml
   - name: Test migrations
     run: npm run db:migrate:test
   ```

### Preventing TypeScript Errors

The CI pipeline should enforce strict TypeScript checking:

```yaml
- name: Strict TypeScript check
  run: npx tsc --noEmit --strict --noImplicitAny --strictNullChecks
```

## Continuous Deployment

For automated deployments, implement a CD pipeline that includes:

1. **Pre-deployment Checks**

   ```yaml
   - name: Pre-deployment checks
     run: ./deployment-checklist.sh
   ```

2. **Database Verification**

   ```yaml
   - name: Verify database connection
     run: node verify-database.js
   ```

3. **Optimized Build**

   ```yaml
   - name: Build for production
     run: ./optimized-production-build.sh
   ```

4. **Deployment with Rollback Strategy**

   ```yaml
   - name: Deploy
     run: ./deploy.sh

   - name: Health check
     run: ./health-check.sh

   - name: Rollback on failure
     if: failure()
     run: ./rollback.sh
   ```

## Production Deployment

### Pre-Deployment Checklist

Before any production deployment, verify:

1. **Environment Variables**: All required environment variables are set
2. **Database Connectivity**: Database is accessible and migrations are up-to-date
3. **Middleware Functionality**: Middleware features work as expected
4. **Build Optimization**: The build is optimized for production

We've implemented this in `deployment-checklist.sh`.

### Optimized Build Process

Use the optimized build scripts we've created:

- `optimized-production-build.sh`: Standard optimized build
- `ultra-minimal-build.sh`: Minimal build for testing
- `staged-build.sh`: Multi-stage build process

These scripts include memory optimizations and proper error handling.

### Middleware Verification

Since middleware is a critical part of the application, always verify it's working:

```bash
#!/bin/bash
# verify-middleware.sh

echo "Verifying middleware functionality..."

# Make a request that should trigger middleware
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/protected-route)

if [ "$RESPONSE" -eq 401 ]; then
  echo "✅ Middleware is working properly (unauthorized access blocked)"
  exit 0
else
  echo "❌ Middleware verification failed"
  exit 1
fi
```

### Database Deployment Considerations

1. **Backup Before Migration**

   ```bash
   # backup-db.sh
   pg_dump $DATABASE_URL > backup_$(date +%Y-%m-%d_%H-%M-%S).sql
   ```

2. **Safe Migration Application**

   ```bash
   # safe-db-push.sh
   npm run db:push -- --dry-run

   if [ $? -eq 0 ]; then
     echo "Safe to apply migrations"
     npm run db:push
   else
     echo "Unsafe migrations detected"
     exit 1
   fi
   ```

3. **Verify After Migration**
   ```typescript
   // verify-after-migration.js
   async function verifyMigration() {
     // Run specific checks to ensure data integrity
     // Check specific tables, columns, etc.
   }
   ```

## Handling ChunkLoadError in Production

To mitigate chunk load errors in production:

1. **Implement Client-Side Retry Logic**

   ```javascript
   // Add to a global script or component
   useEffect(() => {
     const handleChunkError = (event) => {
       if (event.message && event.message.includes("ChunkLoadError")) {
         console.log("Chunk failed to load, retrying...");
         window.location.reload();
       }
     };

     window.addEventListener("error", handleChunkError);
     return () => window.removeEventListener("error", handleChunkError);
   }, []);
   ```

2. **Optimize Webpack Configuration**
   Update `next.config.mjs` with optimized chunk settings (as detailed in the Build Optimization document).

3. **CDN Caching Configuration**
   If using a CDN, ensure proper cache settings for JavaScript chunks:

   ```
   # Example Vercel configuration
   Cache-Control: public, max-age=31536000, immutable
   ```

## Monitoring Production Deployments

Implement monitoring for:

1. **JavaScript Errors**: Track client-side errors including chunk load failures
2. **API Response Times**: Monitor backend performance
3. **Database Query Performance**: Track slow queries
4. **Memory Usage**: Ensure the application doesn't exceed memory limits

## Emergency Rollback Procedure

Document a clear rollback procedure:

```bash
#!/bin/bash
# rollback.sh

echo "Rolling back to previous deployment..."

# Deploy the previous version
git checkout HEAD~1
./deploy.sh

echo "Rollback complete"
```
