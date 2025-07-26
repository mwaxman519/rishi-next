# Replit Staging Deployment Guide

## Overview

This guide outlines the process for deploying the Rishi platform to Replit as a staging environment. Replit provides an excellent platform for staging deployments with its built-in PostgreSQL database and simple deployment process.

## Prerequisites

Before deploying to Replit, ensure you have:

1. A Replit account
2. Access to the Rishi platform repository
3. Basic understanding of Node.js and Next.js

## Deployment Process

### 1. Setting Up the Replit Environment

1. **Create a New Repl**:

   - Select "Import from GitHub" and enter the repository URL
   - Choose Node.js as the language

2. **Configure Environment Variables**:
   - No need to set `DATABASE_URL` as Replit provides this automatically
   - Set any other required environment variables in the Replit Secrets tab

### 2. Database Configuration

Replit provides an integrated PostgreSQL database powered by Neon. To properly use this database:

1. **Database Connection**:

   - Use the automatically provided `DATABASE_URL` environment variable
   - Implement proper environment detection (see [Replit Database Configuration Guide](./replit-database-configuration.md))
   - Do not override the connection string with hardcoded credentials

2. **Schema Initialization**:
   - Use Drizzle to initialize and manage the database schema
   - Run migrations automatically during deployment or manually as needed

```bash
# Initialize database schema
npm run db:push
```

3. **Troubleshooting Connection Issues**:
   - If you encounter authentication errors, refer to the [Database Authentication Failures](./deployment-optimization-guide.md#database-authentication-failures) section
   - Verify the application is using the Replit-provided `DATABASE_URL`

### 3. Build Configuration

1. **Configure Build Process**:

   - Use the enhanced build script for optimized builds

   ```bash
   chmod +x enhanced-build.sh
   ./enhanced-build.sh
   ```

2. **Optimize for Replit**:
   - Ensure webpack configuration is optimized for Replit (extended timeouts, proper chunking)
   - Disable source maps and other development features for faster builds

### 4. Testing the Deployment

1. **Verify Documentation**:

   - Check that all documentation is accessible and properly rendered
   - Test navigation between documentation sections

2. **Test Database Connectivity**:

   - Verify the application can connect to the database
   - Test creating, reading, updating, and deleting records

3. **Test Key Workflows**:
   - Verify user authentication works properly
   - Test RBAC functionality and permission enforcement
   - Confirm calendar and scheduling features function as expected

## Common Issues and Solutions

### 1. Database Connection Failures

**Issue**: "password authentication failed for user 'neondb_owner'"

**Solution**:

- Verify the application is using the Replit-provided `DATABASE_URL`
- Check for any code that might be overriding or modifying the connection string
- Implement the recommended environment detection logic from the [Replit Database Configuration Guide](./replit-database-configuration.md)

### 2. Slow Build Times

**Issue**: Deployment builds take too long to complete

**Solution**:

- Use the optimized build script (`enhanced-build.sh`)
- Configure webpack for faster builds with proper caching
- Disable TypeScript checking and ESLint during builds

### 3. Memory Issues

**Issue**: Build process runs out of memory

**Solution**:

- Adjust Node.js memory allocation in the build script
- Split the build process into smaller steps
- Optimize large components and reduce bundle size

## Differences Between Staging and Production

Understanding the key differences between Replit staging and production environments:

| Feature                 | Replit Staging                    | Production                      |
| ----------------------- | --------------------------------- | ------------------------------- |
| Database                | Replit-provided PostgreSQL        | Dedicated Neon instance         |
| Database Authentication | Automatic via `DATABASE_URL`      | Manual credential configuration |
| Performance             | Good for testing, limited scaling | Optimized for high traffic      |
| Custom Domain           | Replit subdomain                  | Custom domain with SSL          |
| Environment Variables   | Set via Replit Secrets            | Set via deployment platform     |

## Conclusion

Replit provides an excellent platform for staging deployments of the Rishi platform. By following this guide, you can ensure a smooth deployment process with properly configured database connections and optimized build processes.

For any issues not covered in this guide, refer to the [Deployment Optimization Guide](./deployment-optimization-guide.md) or contact the development team for assistance.
