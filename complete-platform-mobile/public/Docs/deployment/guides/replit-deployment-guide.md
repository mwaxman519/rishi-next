# Replit Deployment Guide

This document provides specific guidance for deploying the Rishi application to Replit, addressing memory constraints, build optimizations, and Edge Runtime compatibility.

## Replit Environment Considerations

Replit has several unique characteristics that require special consideration:

1. **Memory Constraints**: Replit has memory limits that can affect the build process.
2. **Edge Runtime**: Replit uses Edge Runtime for server execution.
3. **Build Performance**: Optimizations are needed for efficient builds.
4. **Environment Variables**: Replit provides a specific way to manage environment variables.

## Memory Optimizations

### Memory Allocation

The build process is optimized to work within Replit's memory constraints by:

1. Setting Node.js memory allocation to 1536MB:

   ```bash
   # In deploy-to-replit.sh
   NODE_OPTIONS="--max-old-space-size=1536" npm run build
   ```

2. Implementing chunking optimizations in Next.js configuration:
   ```javascript
   // In next.config.mjs
   const nextConfig = {
     webpack: (config, { isServer }) => {
       // Optimize chunk size for better memory usage
       config.optimization.chunkIds = "deterministic";
       return config;
     },
   };
   ```

### Build Optimizations

1. **Incremental Builds**: Enable incremental builds to reduce memory usage:

   ```javascript
   // In next.config.mjs
   const nextConfig = {
     experimental: {
       incrementalCacheHandlerPath: require.resolve("./cache-handler.js"),
     },
   };
   ```

2. **Simplified Webpack Configuration**: Minimize plugins and loaders:
   ```javascript
   // In next.config.mjs
   const nextConfig = {
     webpack: (config) => {
       // Reduce the number of plugins for memory efficiency
       config.plugins = config.plugins.filter((plugin) => {
         // Keep only essential plugins
         return !plugin.constructor.name.includes("ForkTsCheckerWebpackPlugin");
       });
       return config;
     },
   };
   ```

## Replit Configuration Files

### 1. `.replit` Configuration

The `.replit` file configures how Replit runs the application:

```toml
run = "npm run start"
hidden = [".build", ".config"]

[nix]
channel = "stable-22_11"

[env]
NODE_ENV = "production"
PORT = "3000"

[deployment]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"
```

### 2. `replit.nix` for Dependencies

The `replit.nix` file specifies system dependencies:

```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
  ];
}
```

### 3. Deployment Script

The `deploy-to-replit.sh` script handles the deployment process:

```bash
#!/bin/bash

echo "Starting Replit deployment process..."

# Set memory limit for Node.js
export NODE_OPTIONS="--max-old-space-size=1536"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application with memory optimizations
echo "Building application..."
npm run build

# Output success message
echo "Build completed successfully!"
```

## Database Setup

1. **PostgreSQL Configuration**: Use Neon for serverless PostgreSQL:

   ```bash
   # Required environment variables
   DATABASE_URL=postgresql://user:password@neon.tech/database
   ```

2. **Schema Migration**: Use the Drizzle ORM migration tool:
   ```bash
   # Push schema changes to the database
   npm run db:push
   ```

## Edge Runtime Compatibility

Ensure middleware and API routes work with Edge Runtime:

1. **Simplify Middleware**:

   - Avoid dynamic imports in middleware
   - Use static configurations instead of dynamic ones
   - Minimize async/await usage in middleware

2. **Client/Server Separation**:
   - Create separate client and server versions of services
   - Use 'server-only' to mark server-specific code
   - Avoid importing server code in client components

## Troubleshooting Common Issues

### 1. Memory Errors During Build

**Symptoms**:

- Build fails with "JavaScript heap out of memory" error
- Process exits with code 137

**Solutions**:

- Increase memory allocation (already set to 1536MB)
- Split large components into smaller ones
- Reduce bundle size by optimizing imports
- Use dynamic imports for large dependencies

### 2. Edge Runtime Errors

**Symptoms**:

- "Cannot read properties of undefined (reading 'call')" in browser console
- API routes return 500 errors without detailed logs

**Solutions**:

- Check for circular dependencies
- Ensure middleware is Edge Runtime compatible
- Verify server-only imports aren't used in client components
- Use the provided edge-runtime-compatibility.md guide

### 3. Database Connection Issues

**Symptoms**:

- "Connection refused" errors
- API routes fail with database connectivity errors

**Solutions**:

- Verify DATABASE_URL is set correctly
- Ensure IP allowlisting is configured in Neon dashboard
- Check for proper SSL configuration
- Test connection with a simple query

## Deployment Verification

After deployment, verify the application works correctly:

1. **Health Check**:

   - Visit `/api/health` to confirm API functionality
   - Verify database connection
   - Check environment information

2. **Authentication**:

   - Test login/logout functionality
   - Verify protected routes require authentication
   - Test role-based access controls

3. **Core Functionality**:
   - Test primary user flows
   - Verify API endpoints return expected data
   - Check mobile responsiveness
   - Test error handling

## Monitoring and Maintenance

1. **Logs Access**:

   - View logs in the Replit console
   - Monitor for unexpected errors
   - Check for performance bottlenecks

2. **Updates and Maintenance**:
   - Use Git for version control
   - Update dependencies regularly
   - Monitor database performance
   - Implement regular backups

## Best Practices for Replit Deployment

1. **Code Organization**:

   - Keep related code together
   - Minimize the number of files
   - Use proper separation of concerns

2. **Asset Optimization**:

   - Compress images
   - Minimize CSS and JavaScript
   - Use proper caching strategies

3. **Performance Considerations**:
   - Implement proper caching
   - Use server components for data-heavy operations
   - Optimize API response times

## Conclusion

Deploying to Replit requires specific optimizations and considerations, but with the proper configuration, the application can run efficiently in this environment. Follow this guide to ensure a smooth deployment process and reliable operation.
