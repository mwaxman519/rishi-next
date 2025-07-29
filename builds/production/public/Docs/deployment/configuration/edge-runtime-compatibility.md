# Edge Runtime Compatibility Guide

This document explains how to ensure your code is compatible with Next.js Edge Runtime, which is required for middleware and Edge API routes.

## What is Edge Runtime?

Edge Runtime is a lightweight JavaScript runtime environment that runs on Edge servers (CDN edge nodes). It has several important constraints compared to Node.js:

1. No access to Node.js APIs
2. No dynamic code evaluation (`eval`, `new Function`)
3. No regenerator runtime or transpiled async/await
4. Limited set of Web APIs
5. No file system access

## Common Issues and Solutions

### 1. Circular Dependencies

**Problem**: Circular dependencies can cause the Edge Runtime to fail with errors like:

- "Cannot use import statement outside a module"
- "Cannot read properties of undefined (reading 'call')"

**Solution**:

- Break circular dependencies by introducing interface files
- Use dependency injection patterns
- Create separate client and server versions of files

**Example Fix**:

```typescript
// Before: circular dependency
// userService.ts -> repository.ts -> userService.ts

// After: Breaking the cycle
// userService.ts -> repository.ts
// userService.client.ts (for client components)
```

### 2. Transpiled Async/Await

**Problem**: Babel or TypeScript may transpile async/await to use regenerator-runtime, which isn't available in Edge Runtime.

**Solution**:

- Use native ES2017+ async/await without transpilation
- In middleware, avoid async/await completely if possible
- Use simple promise chains when needed

**Example Fix**:

```typescript
// Before (problematic in Edge Runtime)
export async function middleware(request) {
  const result = await someAsyncOperation();
  return NextResponse.next();
}

// After (Edge Runtime compatible)
export function middleware(request) {
  // Use synchronous code or simple promise patterns
  return NextResponse.next();
}
```

### 3. Server-Only Imports in Client Components

**Problem**: Importing server-only code in client components causes errors in Edge Runtime.

**Solution**:

- Use the 'server-only' package to mark server-only modules
- Create separate client-side versions of server components
- Pass data from server to client components as props

**Example Fix**:

```typescript
// Before (problematic)
// ClientComponent.tsx (with 'use client' directive)
import { db } from "./db"; // server-only import

// After (fixed)
// ClientComponent.tsx (with 'use client' directive)
import { fetchData } from "./clientApi"; // client-safe version

// page.tsx (server component)
import { db } from "./db"; // server-only import is ok here
```

### 4. Dynamic Imports

**Problem**: Dynamic imports may not work properly in Edge Runtime.

**Solution**:

- Use static imports for Edge Runtime code
- Move dynamic imports to client components or API routes that don't use Edge Runtime

### 5. Environment Variable Access

**Problem**: Some methods of accessing environment variables may not work in Edge Runtime.

**Solution**:

- Use `process.env` directly (it's replaced at build time)
- Avoid dynamic environment variable access patterns

## Testing Edge Runtime Compatibility

1. **Local Testing**:

   - Use `next dev` to test your middleware and Edge API routes
   - Check for console errors related to Edge Runtime

2. **Production Build Testing**:

   - Run `next build` to ensure no Edge Runtime compatibility issues are found
   - Check the build output for warnings about Edge Runtime

3. **Runtime Testing**:
   - Deploy to a staging environment that supports Edge Runtime
   - Test all routes that use middleware
   - Monitor for unexpected 500 errors that could indicate Edge Runtime issues

## Real-World Examples from Our Codebase

### Middleware Optimization

Our middleware was optimized for Edge Runtime by:

1. Removing all dynamic code evaluation
2. Avoiding async/await syntax completely
3. Using simple for loops instead of array methods
4. Creating a static configuration object instead of importing it

```javascript
// Edge-compatible middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static array of excluded routes
const PUBLIC_PATHS = [
  '/docs',
  '/api/docs',
  '/_next',
  '/favicon.ico',
  '/api/health',
  '/static',
  '/images',
];

// Simple middleware function - avoid async/await!
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if path should be excluded
  for (let i = 0; i < PUBLIC_PATHS.length; i++) {
    if (pathname.startsWith(PUBLIC_PATHS[i])) {
      return NextResponse.next();
    }
  }

  // All authentication logic is handled in server components/API routes
  return NextResponse.next();
}

// Define the middleware config directly here rather than importing
export const config = {
  matcher: [
    // Match routes but exclude static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Client-Server Separation

We created client versions of server-side repositories:

```typescript
// repository.ts (server-only)
import "server-only";
import { db } from "../db";

// repository.client.ts (client-safe)
// Only contains types and API client methods
import { apiClient } from "../apiClient";
```

### Database Access Pattern

Our database access was optimized to work in both server components and Edge API routes:

```typescript
// Edge-compatible database access
import { neon } from "@neondatabase/serverless";

export const db = neon(process.env.DATABASE_URL!);
```

## Best Practices

1. **Avoid Server-Only in Client Code**: Never import server-only modules in client components.
2. **Simplify Middleware**: Keep middleware logic minimal and avoid complex operations.
3. **Test in Edge Environment**: Regularly test on platforms that use Edge Runtime.
4. **Client/Server Separation**: Maintain clear boundaries between client and server code.
5. **No Dynamic Code**: Avoid any form of dynamic code evaluation in Edge Runtime code.

## Conclusion

By following these guidelines, you'll ensure your Next.js application works reliably in Edge Runtime environments, enabling better performance, lower latency, and more reliable deployments.
