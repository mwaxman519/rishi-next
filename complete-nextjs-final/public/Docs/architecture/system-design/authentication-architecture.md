# Authentication Architecture Documentation

## Overview

The Cannabis Workforce Management Platform implements a comprehensive authentication system that supports different runtime contexts (client, server, edge) while maintaining consistent behavior. The architecture uses JWT (JSON Web Tokens) for authentication and implements role-based access control (RBAC) for authorization.

## Authentication Components

### Core Components

The authentication system is divided into three main modules to support different runtime environments:

#### 1. Client-Side Authentication (`auth-client.ts`)

Provides authentication functionality for client components:

```typescript
// app/lib/auth-client.ts
import { UserRole } from "@/shared/schema";

export async function hashPassword(password: string): Promise<string> {
  // Client-safe password hashing (only used for comparison, not actual storage)
}

export async function comparePasswords(
  stored: string,
  supplied: string,
): Promise<boolean> {
  // Client-safe password comparison
}

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  // Client-side JWT signing (used only for testing/mocking)
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  // Client-side JWT verification
}

export function authResponse(user: any, token: string) {
  // Create standardized auth response for client consumption
}
```

#### 2. Server-Side Authentication (`auth-server.ts`)

Provides authentication functionality for server components and API routes:

```typescript
// app/lib/auth-server.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { UserRole } from "@/shared/schema";

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

// Server-side JWT verification with secure practices
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      id: payload.id as number,
      username: payload.username as string,
      role: payload.role as UserRole,
      fullName: payload.fullName as string | undefined,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Create secure HTTP-only cookie with token
export function createTokenCookie(
  token: string,
  response = new NextResponse(),
) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}

// Clear auth cookie on logout
export function clearTokenCookie(response = new NextResponse()) {
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

// Get auth token from cookies
export async function getAuthToken(): Promise<string | undefined> {
  try {
    // In Next.js 15, cookies() returns a Promise<ReadonlyRequestCookies>
    const cookieStore = await cookies();
    // We need to check for the token after awaiting the cookies promise
    const token = cookieStore.get("auth_token");
    return token?.value;
  } catch (error) {
    console.error("Failed to read auth token:", error);
    return undefined;
  }
}

// Create auth response with proper cookie
export function authResponse(user: any, token: string) {
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    },
  });

  return createTokenCookie(token, response);
}

// Aliases for common functions
export const setAuthCookie = createTokenCookie;
export const clearAuthCookie = clearTokenCookie;
```

#### 3. Edge Runtime Authentication (`auth-edge.ts`)

Provides authentication functionality for middleware and edge functions:

```typescript
// app/lib/auth-edge.ts
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/shared/schema";

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
}

// Edge-compatible JWT verification
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    // Log for debugging
    console.log("Edge verifyJwt called with token length:", token.length);
    console.log("Edge JWT_SECRET length:", process.env.JWT_SECRET!.length);

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
      const { payload } = await jwtVerify(token, secretKey);

      return {
        id: payload.id as number,
        username: payload.username as string,
        role: payload.role as UserRole,
        fullName: payload.fullName as string | undefined,
      };
    } catch (e) {
      console.error("JWT verification error in wrapper:", e);

      // Fall back to manually decoding payload for debugging
      console.log("Token length:", token.length);
      console.log("Secret length:", secretKey.length);
      console.log("Secret used:", process.env.JWT_SECRET);

      console.log("JWT verification failed:", e);

      try {
        // Manual decode for debugging (NOT for validation)
        const base64Payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        console.log("Edge JWT manual decode of payload:", decodedPayload);
      } catch (decodeError) {
        console.error("Could not decode token manually:", decodeError);
      }

      return null;
    }
  } catch (error) {
    console.error("Error in verifyJwt:", error);
    return null;
  }
}

// Get auth token from cookies in edge runtime
export async function getAuthToken(): Promise<string | undefined> {
  try {
    // In Next.js 15, cookies() returns a Promise<ReadonlyRequestCookies>
    const cookieStore = await cookies();
    // We need to check for the token after awaiting the cookies promise
    const token = cookieStore.get("auth_token");
    return token?.value;
  } catch (error) {
    console.error("Failed to read auth token in edge runtime:", error);
    return undefined;
  }
}
```

### Unified Auth Module (`auth.ts`)

A unified module that re-exports the appropriate functions based on the runtime context:

```typescript
// app/lib/auth.ts
// This file exports auth functions from the appropriate module based on runtime

export {
  hashPassword,
  comparePasswords,
  signJwt,
  verifyJwt,
  createTokenCookie,
  clearTokenCookie,
  getAuthToken,
  authResponse,
  setAuthCookie,
  clearAuthCookie,
} from "./auth-server";

export type { JwtPayload } from "./auth-server";
```

## Authentication Service

The authentication service provides business logic for user authentication:

```typescript
// app/services/auth/authService.ts
import { compare, hash } from "bcrypt";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { userService } from "../users/userService";
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  VerifyTokenResult,
} from "./models";
import { eventBus } from "@/app/shared/events";
import { createTokenCookie, clearTokenCookie, verifyJwt } from "@/app/lib/auth";

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          error: "Passwords do not match",
        };
      }

      // Check if username already exists
      const existingUser = await userService.getUserByUsername(data.username);
      if (existingUser.success && existingUser.data) {
        return {
          success: false,
          error: "Username already exists",
        };
      }

      // Hash password
      const hashedPassword = await hash(data.password, 10);

      // Create user
      const result = await userService.createUser({
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        email: data.email,
        role: data.role || "USER",
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to create user",
        };
      }

      // Create JWT token
      const user = result.data!;
      const token = await this.generateToken(user);

      // Emit event
      eventBus.emit("user.created", {
        id: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed",
      };
    }
  }

  /**
   * Login a user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Get user with credentials
      const userResult = await userService.getUserWithCredentials(
        data.username,
      );

      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      const user = userResult.data;

      // Check if user is active
      if (!user.active) {
        return {
          success: false,
          error: "Account is inactive",
        };
      }

      // Verify password
      if (!user.password) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      const passwordMatch = await compare(data.password, user.password);
      if (!passwordMatch) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      // Generate JWT token
      const token = await this.generateToken(user);

      // Emit event
      eventBus.emit("user.login", {
        id: user.id,
        username: user.username,
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Login failed",
      };
    }
  }

  /**
   * Logout a user
   */
  async logout(userId: number): Promise<boolean> {
    try {
      // Emit logout event
      eventBus.emit("user.logout", { id: userId });
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  /**
   * Verify a JWT token
   */
  async verifyToken(token: string): Promise<VerifyTokenResult> {
    try {
      const payload = await verifyJwt(token);

      if (!payload) {
        return {
          valid: false,
          error: "Invalid token",
        };
      }

      return {
        valid: true,
        user: {
          id: payload.id,
          username: payload.username,
          role: payload.role,
          fullName: payload.fullName,
        },
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return {
        valid: false,
        error: "Token verification failed",
      };
    }
  }

  /**
   * Create authentication response with cookie
   */
  createAuthResponse(user: AuthUser, token: string): NextResponse {
    return createTokenCookie(
      token,
      NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        },
      }),
    );
  }

  /**
   * Create logout response with cleared cookie
   */
  createLogoutResponse(): NextResponse {
    return clearTokenCookie(
      NextResponse.json({
        success: true,
        message: "Logged out successfully",
      }),
    );
  }

  /**
   * Generate JWT token
   */
  private async generateToken(user: AuthUser): Promise<string> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    return token;
  }
}

export const authService = new AuthService();
```

## Authentication API Routes

The API routes for authentication implement the login, register, and logout functionality:

### Login Route

```typescript
// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { authService } from "@/app/services/auth/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.username || !body.password) {
      return Response.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 },
      );
    }

    // Attempt login
    const result = await authService.login({
      username: body.username,
      password: body.password,
    });

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 },
      );
    }

    // Create response with auth cookie
    return authService.createAuthResponse(result.user!, result.token!);
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 },
    );
  }
}
```

### Register Route

```typescript
// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { authService } from "@/app/services/auth/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.username || !body.password || !body.confirmPassword) {
      return Response.json(
        {
          success: false,
          error: "Username, password, and confirmPassword are required",
        },
        { status: 400 },
      );
    }

    // Attempt registration
    const result = await authService.register({
      username: body.username,
      password: body.password,
      confirmPassword: body.confirmPassword,
      fullName: body.fullName,
      email: body.email,
      role: body.role,
    });

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      );
    }

    // Create response with auth cookie
    return authService.createAuthResponse(result.user!, result.token!);
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        success: false,
        error: "An error occurred during registration",
      },
      { status: 500 },
    );
  }
}
```

### Logout Route

```typescript
// app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { authService } from "@/app/services/auth/authService";
import { getAuthToken, verifyJwt } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = await getAuthToken();

    if (token) {
      // Verify token to get user ID
      const payload = await verifyJwt(token);

      if (payload) {
        // Trigger logout event
        await authService.logout(payload.id);
      }
    }

    // Clear auth cookie regardless of token validity
    return authService.createLogoutResponse();
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear the cookie even if there's an error
    return authService.createLogoutResponse();
  }
}
```

### Current User Route

```typescript
// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyJwt } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const payload = await verifyJwt(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        username: payload.username,
        role: payload.role,
        fullName: payload.fullName,
      },
    });
  } catch (error) {
    console.error("Auth/me error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Authentication error",
      },
      { status: 500 },
    );
  }
}
```

## Authentication Middleware

The middleware protects routes based on the user's role and authentication status:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyJwt } from "./app/lib/auth-edge";
import { routePermissions, canAccessRoute } from "./app/lib/rbac";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes and API routes that handle their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(css|js|png|jpg|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  console.log("Middleware token check:", await checkToken(request));

  // Get the token from cookies
  const token = await getAuthToken();

  // If no token, redirect to login page
  if (!token) {
    console.log("Middleware user result: No user");

    // Allow access to login and register pages
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }

    // Redirect to login page with return URL
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Verify the token
  const user = await verifyJwt(token);

  if (!user) {
    console.log("Middleware user result: No user");

    // Allow access to login and register pages
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }

    // Redirect to login page with return URL
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(url);
  }

  console.log("Middleware user result:", user);

  // Check if the user has permission to access the route
  const hasPermission = canAccessRoute(user.role, pathname);

  if (!hasPermission) {
    // Redirect to access denied page
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

async function checkToken(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return "No token";
    }

    return `Token length: ${token.length}`;
  } catch (error) {
    return `Error checking token: ${error}`;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Role-Based Access Control (RBAC)

The RBAC system defines permissions for different user roles:

```typescript
// app/lib/rbac.ts
import { USER_ROLES } from "@/shared/schema";

export type UserRole =
  | typeof USER_ROLES.ADMIN
  | typeof USER_ROLES.BRAND_AGENT
  | typeof USER_ROLES.MANAGER
  | typeof USER_ROLES.USER;

export type Permission =
  | "view:users"
  | "create:users"
  | "edit:users"
  | "delete:users"
  | "view:availability"
  | "edit:availability"
  | "view:admin"
  | "edit:system";

// Permission mapping by role
const rolePermissions: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    "view:users",
    "create:users",
    "edit:users",
    "delete:users",
    "view:availability",
    "edit:availability",
    "view:admin",
    "edit:system",
  ],
  [USER_ROLES.MANAGER]: [
    "view:users",
    "create:users",
    "edit:users",
    "view:availability",
    "edit:availability",
  ],
  [USER_ROLES.BRAND_AGENT]: ["view:availability", "edit:availability"],
  [USER_ROLES.USER]: ["view:availability"],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole | undefined,
  permission: Permission,
): boolean {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(permission) || false;
}

/**
 * Check if a user has any of the given permissions
 */
export function hasAnyPermission(
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  return permissions.some((permission) =>
    rolePermissions[userRole]?.includes(permission),
  );
}

/**
 * Check if a user has all of the given permissions
 */
export function hasAllPermissions(
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  return permissions.every((permission) =>
    rolePermissions[userRole]?.includes(permission),
  );
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Route access control configuration
 */
export const routePermissions: Record<string, Permission | null> = {
  "/": null, // Public route
  "/login": null, // Public route
  "/register": null, // Public route
  "/profile": null, // Requires authentication but no special permission
  "/users": "view:users",
  "/users/create": "create:users",
  "/users/edit": "edit:users",
  "/availability": "view:availability",
  "/availability/manage": "edit:availability",
  "/availability/integrations": "edit:availability",
  "/admin": "view:admin",
  "/admin/settings": "edit:system",
};

/**
 * Check if a user has permission to access a route
 */
export function canAccessRoute(
  userRole: UserRole | undefined,
  route: string,
): boolean {
  if (!userRole) return false;

  // Find the route permission
  let permission: Permission | null = null;

  // Check exact route match
  if (routePermissions[route] !== undefined) {
    permission = routePermissions[route];
  } else {
    // Check for pattern matches
    for (const [pattern, perm] of Object.entries(routePermissions)) {
      if (route.startsWith(pattern)) {
        permission = perm;
        break;
      }
    }
  }

  // If no permission required, allow access
  if (permission === null) {
    return true;
  }

  // Check if user has the required permission
  return hasPermission(userRole, permission);
}
```

## Client-Side Authentication Hook

A React hook provides authentication state and methods for client components:

```typescript
// app/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/shared/schema';

type User = {
  id: number;
  username: string;
  role: UserRole;
  fullName?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, confirmPassword: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user on initial mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);

        // Redirect to returnUrl or default page
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl') || '/availability';
        router.push(returnUrl);

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, password: string, confirmPassword: string, role?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          role: role || 'USER'
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        router.push('/availability');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Authorization Hook

A React hook provides authorization checking for client components:

```typescript
// app/hooks/useAuthorization.tsx
import { useAuth } from "@/hooks/useAuth";
import {
  Permission,
  UserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/rbac";

export function useAuthorization() {
  const { user } = useAuth();

  return {
    // Check if user has a specific permission
    checkPermission: (permission: Permission) => {
      return hasPermission(user?.role, permission);
    },

    // Check if user has any of the specified permissions
    checkAnyPermission: (permissions: Permission[]) => {
      return hasAnyPermission(user?.role, permissions);
    },

    // Check if user has all of the specified permissions
    checkAllPermissions: (permissions: Permission[]) => {
      return hasAllPermissions(user?.role, permissions);
    },

    // Check if user is at least the specified role (or higher)
    isAtLeastRole: (role: UserRole) => {
      if (!user) return false;

      const roleHierarchy = {
        [UserRole.ADMIN]: 4,
        [UserRole.MANAGER]: 3,
        [UserRole.BRAND_AGENT]: 2,
        [UserRole.USER]: 1,
      };

      return roleHierarchy[user.role] >= roleHierarchy[role];
    },
  };
}
```

## Security Considerations

The authentication system implements several security best practices:

1. **HTTP-Only Cookies**: JWT tokens are stored in HTTP-only cookies to prevent access by JavaScript
2. **Secure Flag**: Cookies are marked as secure in production to ensure HTTPS-only transmission
3. **CSRF Protection**: The SameSite=Strict setting prevents cross-site request forgery
4. **Token Expiration**: JWTs have a configurable expiration time (default: 7 days)
5. **Strong Password Hashing**: Passwords are hashed using bcrypt with appropriate cost factor
6. **Consistent-Time Comparison**: Password verification uses timing-safe comparison
7. **Role-Based Access Control**: Granular permissions based on user roles
8. **Middleware Protection**: Routes are protected by middleware that verifies authentication and authorization

## Authentication Flow

### Login Flow

1. User submits username and password to `/api/auth/login`
2. API route validates input and calls authService.login()
3. authService verifies credentials against stored user data
4. On success, a JWT is generated and stored in an HTTP-only cookie
5. User information is returned to the client
6. Client updates auth context state
7. User is redirected to the requested page or default route

### Authentication Verification Flow

1. Middleware runs for protected routes
2. Middleware extracts JWT from cookies
3. JWT is verified using the secret key
4. User role is extracted from the verified token
5. Middleware checks if the user role has permission for the requested route
6. If authorized, the request proceeds; otherwise, the user is redirected

## Error Handling

The authentication system implements robust error handling:

1. **Specific Error Messages**: Auth failures return specific error messages
2. **Generic Security Messages**: User-facing errors are generic to prevent information disclosure
3. **Detailed Logging**: Detailed errors are logged server-side for debugging
4. **Fallback Mechanisms**: Edge functions have fallback mechanisms for JWT verification
5. **Graceful Degradation**: If auth fails, users are redirected to login with return URLs

## Future Enhancements

1. **Refresh Token Rotation**: Implement refresh token rotation for enhanced security
2. **Multi-Factor Authentication**: Add support for MFA with SMS or authenticator apps
3. **OAuth Integration**: Expand social login options beyond Google
4. **Session Management**: Allow users to manage and revoke active sessions
5. **IP-Based Restrictions**: Add IP-based access controls for sensitive operations
6. **Rate Limiting**: Implement rate limiting for auth endpoints to prevent brute force attacks
