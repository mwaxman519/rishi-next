# Authentication Architecture

## Overview

The authentication system in our application is designed to work seamlessly across different Next.js runtime environments (client, server, and edge). This document explains the architecture and implementation details of our authentication system.

## Runtime Separation

Next.js applications run in three distinct runtime environments, each with different capabilities and constraints:

1. **Client Runtime**: JavaScript executed in the browser
2. **Server Runtime**: Node.js code executed on the server during request handling
3. **Edge Runtime**: Lightweight serverless functions executed at the edge

To handle authentication properly across these environments, we've developed a carefully separated authentication architecture.

## Authentication Files Structure

We use three separate files for authentication code:

1. **`auth-client.ts`**: Contains code that runs exclusively in the browser
2. **`auth-server.ts`**: Contains code that runs on the server with full Node.js capabilities
3. **`auth-edge.ts`**: Contains lightweight code that can run in the Edge runtime

```
app/
  ├── lib/
  │   ├── auth-client.ts     # Browser-only authentication code
  │   ├── auth-server.ts     # Server-only authentication code with Node.js features
  │   └── auth-edge.ts       # Edge-compatible authentication code
  │
  ├── api/
  │   └── auth/
  │       ├── login/
  │       │   └── route.ts   # Uses auth-server.ts
  │       ├── register/
  │       │   └── route.ts   # Uses auth-server.ts
  │       └── logout/
  │           └── route.ts   # Uses auth-server.ts
  │
  └── middleware.ts          # Uses auth-edge.ts
```

## Common Authentication Types

All three authentication modules share common types to ensure consistency:

```typescript
// Common types used across all auth modules
export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}
```

## auth-client.ts

Contains browser-safe authentication code:

```typescript
// auth-client.ts - Browser-only authentication utilities

import { joseClient } from "jose"; // Browser-compatible jose import

export async function hashPassword(password: string): Promise<string> {
  // Browser-compatible password hashing
  // Note: In real implementations, password hashing should happen server-side
}

export async function comparePasswords(
  stored: string,
  supplied: string,
): Promise<boolean> {
  // Browser-compatible password comparison
  // Note: In real implementations, password comparison should happen server-side
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  // Browser-compatible JWT signing
  // Used only for development/testing
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  // Browser-compatible JWT verification
  // Used for client-side validation
}
```

## auth-server.ts

Contains server-side authentication code with full Node.js capabilities:

```typescript
// auth-server.ts - Server-only authentication utilities

import { hash, compare } from "bcrypt"; // Node.js-specific module
import { SignJWT, jwtVerify } from "jose"; // Full jose functionality

export async function hashPassword(password: string): Promise<string> {
  // Server-side password hashing using bcrypt
  return hash(password, 10);
}

export async function comparePasswords(
  stored: string,
  supplied: string,
): Promise<boolean> {
  // Server-side password comparison using bcrypt
  return compare(supplied, stored);
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  // Server-side JWT signing
  const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_development",
  );

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  // Server-side JWT verification
  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_for_development",
    );
    const { payload } = await jwtVerify(token, secretKey);

    return payload as JwtPayload;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}

export function createTokenCookie(
  token: string,
  response = new NextResponse(),
) {
  // Set HTTP-only cookie with the JWT token
  response.cookies.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

export function clearTokenCookie(response = new NextResponse()) {
  // Clear the auth cookie
  response.cookies.set({
    name: "auth-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getAuthToken(): Promise<string | undefined> {
  try {
    // In Next.js 15, cookies() returns a Promise<ReadonlyRequestCookies>
    const cookieStore = await cookies();
    // We need to check for the token after awaiting the cookies promise
    const token = cookieStore.get("auth-token");
    return token?.value;
  } catch (error) {
    console.error("Failed to read auth token:", error);
    return undefined;
  }
}
```

## auth-edge.ts

Contains lightweight authentication code compatible with Edge Runtime:

```typescript
// auth-edge.ts - Edge-compatible authentication utilities

import { jwtVerify } from "./jose-wrapper"; // Minimal jose implementation

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  // Edge-compatible JWT verification
  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_for_development",
    );
    const { payload } = await jwtVerify(token, secretKey);

    return payload as JwtPayload;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  try {
    // In Next.js 15, cookies() returns a Promise<ReadonlyRequestCookies>
    const cookieStore = await cookies();
    // We need to check for the token after awaiting the cookies promise
    const token = cookieStore.get("auth-token");
    return token?.value;
  } catch (error) {
    console.error("Failed to read auth token in edge runtime:", error);
    return undefined;
  }
}
```

## API Routes Implementation

The authentication API routes use the server-side authentication code:

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth/authService";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  const result = await authService.login({ username, password });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 },
    );
  }

  // Create response with auth cookie
  return authService.createAuthResponse(result.user!, result.token!);
}
```

```typescript
// app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { authService } from "@/services/auth/authService";

export async function POST(request: NextRequest) {
  // Create response that clears the auth cookie
  return authService.createLogoutResponse();
}
```

## Middleware Implementation

The middleware uses the edge-compatible authentication code:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./lib/auth-edge";
import { routePermissions, canAccessRoute } from "./lib/rbac";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  let user = null;
  if (token) {
    user = await verifyJwt(token);
  }

  // Check if the current route requires authentication
  const path = request.nextUrl.pathname;

  // Public routes - no auth required
  if (path === "/login" || path === "/register") {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - auth required
  if (!user) {
    // Redirect to login if no valid token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (!canAccessRoute(user.role, path)) {
    // Redirect to unauthorized page
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/availability/:path*",
    "/login",
    "/register",
  ],
};
```

## Client-Side Authentication Hooks

We provide React hooks for client-side authentication:

```typescript
// app/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/shared/schema';

type User = {
  id: number;
  username: string;
  role: UserRole;
  full_name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, confirmPassword: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login function
  async function login(username: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Register function
  async function register(username: string, password: string, confirmPassword: string, role?: string) {
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Logout function
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Authentication Flow

1. **Registration**:

   - User submits registration form
   - Client calls `/api/auth/register` endpoint
   - Server hashes password and creates user
   - JWT token is generated and set as HTTP-only cookie
   - User info (without password) is returned to client

2. **Login**:

   - User submits login form
   - Client calls `/api/auth/login` endpoint
   - Server verifies credentials
   - JWT token is generated and set as HTTP-only cookie
   - User info is returned to client

3. **Authentication Checking**:

   - Middleware intercepts requests to protected routes
   - Token is extracted from cookies
   - Token is verified using edge-compatible code
   - If valid, request proceeds; otherwise redirects to login

4. **Logout**:
   - User clicks logout
   - Client calls `/api/auth/logout` endpoint
   - Server clears the authentication cookie
   - Client updates state to remove user info

## Security Considerations

1. **HTTP-Only Cookies**: JWTs are stored in HTTP-only cookies to prevent XSS attacks
2. **CSRF Protection**: Implemented using the SameSite cookie attribute
3. **Secure Flag**: Cookies have the Secure flag in production
4. **JWT Expiration**: Tokens expire after 24 hours
5. **Environment Variables**: JWT secret is stored in environment variables
6. **Password Hashing**: Passwords are hashed using bcrypt before storage

## Best Practices

1. **Use appropriate auth module for each context**:

   - Client components: Import from `auth-client.ts`
   - API routes & server components: Import from `auth-server.ts`
   - Middleware: Import from `auth-edge.ts`

2. **Never expose sensitive data**:

   - Never return password hashes to clients
   - Only include necessary data in JWT payloads
   - Minimize token size by excluding non-essential user data

3. **Proper error handling**:

   - Return appropriate HTTP status codes
   - Provide helpful but not overly detailed error messages
   - Log authentication failures for monitoring

4. **Testing considerations**:
   - Mock authentication for unit tests
   - Include authentication in integration tests
   - Test each runtime environment separately

## Conclusion

This authentication architecture provides a robust, secure solution that works across Next.js runtime environments. By carefully separating code for each environment, we ensure optimal performance and compatibility while maintaining strong security practices.
