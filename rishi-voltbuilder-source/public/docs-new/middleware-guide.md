# Next.js Middleware Guide

This guide covers the setup, usage, and common issues related to Next.js middleware in our application.

## What is Middleware?

Middleware in Next.js allows you to run code before a request is completed. It can be used for:

- Authentication
- Bot protection
- Redirects and rewrites
- Headers manipulation
- A/B testing
- Internationalization

## Middleware Configuration

### Basic Setup

Our middleware is configured in the root `middleware.ts` file:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware logic here
  return NextResponse.next();
}

// Define which routes middleware applies to
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Important Matcher Configuration

The matcher configuration determines which routes the middleware processes:

```typescript
export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",

    // Apply to all pages except static files, images, etc.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

You can also use more specific matchers:

```typescript
export const config = {
  matcher: [
    // Match specific paths
    "/dashboard/:path*",
    "/profile/:path*",

    // Match with regex
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
};
```

## Common Middleware Use Cases

### Authentication Middleware

```typescript
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  // Protected routes
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/profile");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

### Handling Headers

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}
```

### Environment-Based Disabling

You can conditionally disable middleware in certain environments:

```typescript
export function middleware(request: NextRequest) {
  // Skip middleware in specific environments
  if (process.env.DISABLE_MIDDLEWARE === "true") {
    return NextResponse.next();
  }

  // Middleware logic
  // ...
}
```

## Compatibility Issues

### Static Export Incompatibility

Middleware is **not compatible** with Next.js Static Export (`output: 'export'` in `next.config.mjs`). If you need to use static export, you must disable middleware.

To check if your configuration is compatible, run:

```bash
./verify-middleware.sh
```

### Edge Runtime Limitations

Middleware runs in the Edge Runtime, which has limitations:

- Limited Node.js APIs available
- No access to the filesystem
- Limited NPM packages compatibility
- No access to environment variables except those prefixed with `NEXT_PUBLIC_`

## Debugging Middleware

### Logging

For debugging, use `console.log` statements in middleware, which will appear in the server logs:

```typescript
export function middleware(request: NextRequest) {
  console.log("Middleware executing for:", request.nextUrl.pathname);
  return NextResponse.next();
}
```

### Testing Middleware Locally

To verify middleware is working properly:

1. Start the development server
2. Open browser DevTools -> Network tab
3. Look for request headers being modified by your middleware

## Performance Considerations

### Minimize Middleware Execution

Optimize performance by:

1. Using specific matchers to limit middleware execution
2. Keeping middleware logic minimal and efficient
3. Avoiding excessive database queries or API calls in middleware
4. Using caching where appropriate

### Middleware Size Limits

Middleware has a size limit of 1MB (including all imports). Keep your middleware file and its dependencies small.

## Deployment Considerations

Before deploying:

1. Run the middleware verification script:

   ```bash
   ./verify-middleware.sh
   ```

2. Ensure middleware is compatible with your hosting platform
3. Test middleware in a staging environment
4. Monitor performance after deployment

## Common Issues and Solutions

### "Middleware can not be used with 'output: export'" Error

**Problem**: You're using static export with middleware.

**Solution**: Either:

- Remove `output: 'export'` from `next.config.mjs`, or
- Remove/disable middleware functionality

### CORS Issues with API Routes

**Problem**: Middleware affecting CORS headers on API routes.

**Solution**:

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only add CORS headers to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}
```

### Cookie Access Issues

**Problem**: Can't access or set cookies correctly.

**Solution**: Use the correct Next.js cookie API:

```typescript
// Reading cookies
const token = request.cookies.get("token")?.value;

// Setting cookies
const response = NextResponse.next();
response.cookies.set("token", "value", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
});
```

## Resources

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Edge Runtime Documentation](https://nextjs.org/docs/app/api-reference/edge)
- [Middleware API Reference](https://nextjs.org/docs/app/api-reference/functions/next-server)
