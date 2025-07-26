# Rishi Platform Deployment Guide

## Overview

This guide outlines the steps for deploying the Rishi platform efficiently, with a focus on optimizing build times and ensuring reliability.

## Deployment Process

### Prerequisites

- Node.js 18+ (preferably 20.x)
- Access to the Replit environment
- Proper environment variables configured

### Environment Variables

Ensure these variables are properly set:

- `DATABASE_URL`: Connection string to the Neon database
- `JWT_SECRET`: Secret for JWT token generation
- `NEXT_PUBLIC_API_URL`: Base URL for API calls
- `NODE_ENV`: Set to 'production' for deployments

### Build Steps

1. **Prepare the environment**

   The deployment process will use our enhanced build script which:

   - Clears the Next.js cache
   - Allocates sufficient memory for the build
   - Optimizes JavaScript compilation

2. **Run the enhanced build**

   ```bash
   # Make the script executable if needed
   chmod +x enhanced-build.sh

   # Run the enhanced build
   ./enhanced-build.sh
   ```

3. **Start the application**

   ```bash
   # Start the production server
   npm start
   ```

## Optimization Strategies

To optimize the deployment process, we've implemented several strategies:

### 1. Enhanced Build Configuration

We've optimized the Next.js configuration to significantly reduce build times:

- SWC minification for faster JavaScript compilation
- Optimized webpack configuration with improved code splitting
- Memory-optimized build process
- Tailored chunk sizing for better performance

### 2. Image Optimization

Images are processed more efficiently through:

- Defined device and image size sets
- WebP format optimization
- Strategic preloading of critical images

### 3. Code Splitting

The application uses an optimized code splitting strategy:

- Framework code is separated for better caching
- UI components (Radix UI) are bundled together
- Calendar components have dedicated chunks
- Common code is identified and shared

### 4. Documentation Handling

Documentation is included in the build with optimized processing:

- MDX content is processed with efficient plugins
- Documentation assets are properly tracked
- Rehype plugins optimize code highlighting

## Troubleshooting Deployment Issues

### Slow Build Times

If builds are still taking too long:

1. Check if you're using the enhanced build script
2. Monitor memory usage during the build process
3. Verify that the .swcrc file is properly configured
4. Consider temporarily disabling source maps

### Chunk Load Errors

If you encounter chunk loading errors:

1. Increase the chunk timeout in next.config.mjs
2. Review the code splitting configuration
3. Check network conditions and CDN settings

### Memory Issues

If the build process runs out of memory:

1. Increase NODE_OPTIONS memory allocation in the build script
2. Consider a phased build approach
3. Review and optimize large dependencies

## Maintenance

Regular maintenance tasks to ensure optimal deployment:

1. **Package Cleanup**

   Regularly review and remove unused dependencies:

   ```bash
   npx depcheck
   ```

2. **Cache Management**

   Clear the Next.js cache when experiencing build issues:

   ```bash
   rm -rf .next/cache
   ```

3. **Build Monitoring**

   Monitor build performance over time to identify slow areas.

## Performance Tuning

For further performance improvements:

1. Consider implementing dynamic imports for less frequently used components
2. Add Incremental Static Regeneration (ISR) for appropriate routes
3. Optimize client-side state management to reduce re-renders

## Security Considerations

When deploying to production, ensure:

1. JWT secrets are properly secured
2. Database connection strings use TLS
3. API rate limiting is enabled
4. Content Security Policy (CSP) is configured

---

By following this guide, you should experience faster, more reliable deployments of the Rishi platform.
