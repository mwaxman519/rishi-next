# Next.js Application Documentation

## Documentation Index

1. [TypeScript Guidelines](./typescript-guidelines.md)

   - Best practices for TypeScript in Next.js
   - Common type issues and fixes
   - Database schema typing with Drizzle

2. [Middleware Guide](./middleware-guide.md)

   - Middleware configuration and usage
   - Compatibility considerations
   - Authentication with middleware

3. [Database Guide](./database-guide.md)

   - PostgreSQL with Neon and Drizzle ORM
   - Schema management and migrations
   - Connection verification

4. [Authentication & RBAC System](./auth-rbac-system.md)

   - JWT-based authentication flow
   - Role-based access control implementation
   - Permission checking and error handling
   - Type safety and best practices

5. [Production Deployment](./production-deployment.md)

   - Deployment process and considerations
   - Environment configurations
   - Performance optimization

6. [Replit Staging Guide](./replit-staging-guide.md)
   - Setting up Replit as a staging environment
   - Deploying to Replit for testing
   - Troubleshooting staging deployments

## Key Scripts

The project includes several utility scripts to help with development and deployment:

### Type Checking

```bash
./check-types.sh
```

Runs TypeScript type checking with optimal memory settings.

### Production Build with Checks

```bash
./production-build-with-checks.sh
```

Performs comprehensive pre-deployment checks including TypeScript verification, database connectivity testing, and middleware compatibility before building for production.

### Middleware Verification

```bash
./verify-middleware.sh
```

Verifies that middleware configuration is compatible with your Next.js setup.

### Database Verification

```bash
node verify-database.js
```

Tests database connectivity and schema access.

### Staging Setup Verification

```bash
./verify-staging-setup.sh
```

Checks if all required components for Replit staging deployment are in place.

### Replit Deployment

```bash
./replit-deploy.sh
```

Prepares and builds the application for Replit staging deployment, including database verification, middleware compatibility checks, and TypeScript type checking.

## Development Workflow

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Before committing changes, check for TypeScript errors:

   ```bash
   ./check-types.sh
   ```

3. Use the utility functions in `shared/utils.ts` for type-safe operations.

4. Follow the TypeScript guidelines when writing code.

## Common Issues and Solutions

### ChunkLoadError

If you encounter "ChunkLoadError: Loading chunk X failed" during production:

1. The issue may be related to code splitting and lazy loading.
2. Check that dynamic imports are properly configured.
3. The `next.config.mjs` file includes optimizations for chunking to avoid these issues.

### Database Connection Issues

If database connection fails:

1. Verify the `DATABASE_URL` environment variable is set.
2. Run `node verify-database.js` to diagnose connectivity issues.
3. Check network connectivity and firewall settings.

### Middleware Errors

If middleware isn't working as expected:

1. Ensure your Next.js configuration is compatible (not using `output: 'export'`).
2. Review `middleware.ts` to ensure paths are correctly configured.
3. Run `./verify-middleware.sh` to check for common configuration issues.

### Authentication & RBAC Issues

If you're experiencing authentication or permission issues:

1. Check for "undefined role" errors in the console which may indicate missing role checks.
2. Verify that new user roles are properly added to the rolePermissions mapping in `app/lib/rbac.ts`.
3. Use the helper functions in `app/lib/rbac.ts` rather than directly accessing role permissions.
4. For JWT issues, check that the JWT secret is consistent across environments.
5. See the [Authentication & RBAC System](./auth-rbac-system.md) documentation for more details.

## Tech Stack

- **Framework**: Next.js 15.2.2
- **UI Library**: React 19.1.0-canary
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: Custom JWT implementation
- **TypeScript**: Strict mode enabled
- **Deployment**: Azure Static Web Apps / Replit
