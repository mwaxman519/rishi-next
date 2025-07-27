# Authentication and Role-Based Access Control (RBAC) System

## Overview

This document provides a comprehensive overview of the authentication and role-based access control (RBAC) system used in our application. The system provides secure, role-based access to features and routes based on user permissions.

## System Architecture

The authentication and RBAC system consists of several interconnected components:

![Authentication and RBAC Architecture](../assets/auth-rbac-architecture.png)

### Key Components

1. **Schema Definition** (shared/schema.ts)
2. **Authentication Service** (app/lib/auth-client.ts, app/lib/jose-wrapper.ts)
3. **RBAC Framework** (app/lib/rbac.ts)
4. **React Hooks** (app/hooks/useAuth.tsx, app/hooks/useAuthorization.tsx)
5. **Middleware** (middleware.ts)
6. **Permission Components** (app/components/authorization/PermissionGuard.tsx)

## 1. Schema and Types

### User Roles

User roles are defined in `shared/schema.ts`:

```typescript
export const USER_ROLES = {
  ADMIN: "admin",
  BRAND_AGENT: "brand_agent",
  MANAGER: "manager",
  USER: "user",
  EMPLOYEE: "employee",
  HR_MANAGER: "hr_manager",
  COMPLIANCE_OFFICER: "compliance_officer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

The `UserRole` type ensures type safety throughout the application by restricting role values to those defined in the `USER_ROLES` object.

## 2. Authentication Flow

The authentication process follows these steps:

1. **User Login**: Credentials are validated against the database
2. **JWT Creation**: Upon successful authentication, a JSON Web Token is generated with user details including their role
3. **Token Storage**: The JWT is stored in an HTTP-only cookie for security
4. **Request Validation**: Each secured request validates the token via middleware
5. **Permission Checks**: The user's role and permissions are verified for protected routes and actions

```typescript
// Example JWT payload structure
interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  name: string; // User name
  role: UserRole; // User role
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
```

## 3. RBAC System

### Permission Types

Permissions are defined as string literals with an `action:resource` pattern:

```typescript
export type Permission =
  | "view:users"
  | "create:users"
  | "edit:users"
  | "delete:users"
  | "view:availability"
  | "edit:availability"
  | "view:admin"
  | "edit:system";
```

### Role-Permission Mapping

Roles are mapped to permissions through a structured object:

```typescript
export const rolePermissions: Record<string, Permission[]> = {
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
  [USER_ROLES.EMPLOYEE]: ["view:availability"],
  [USER_ROLES.HR_MANAGER]: [
    "view:users",
    "create:users",
    "edit:users",
    "view:availability",
  ],
  [USER_ROLES.COMPLIANCE_OFFICER]: [
    "view:users",
    "view:availability",
    "view:admin",
  ],
};
```

### Safe Access to Role Permissions

A dedicated helper function ensures safe access to role permissions:

```typescript
/**
 * Safely get permissions for a role
 */
function getRolePermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return rolePermissions[role] || [];
}
```

### Permission Check Functions

The system includes several utility functions for checking permissions:

```typescript
/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole | undefined,
  permission: Permission,
): boolean {
  if (!userRole) return false;
  const rolePerms = getRolePermissions(userRole);
  if (!rolePerms.length) {
    console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
    return false;
  }
  return rolePerms.includes(permission);
}

/**
 * Check if a user has any of the given permissions
 */
export function hasAnyPermission(
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  const userPermissions = getRolePermissions(userRole);
  if (!userPermissions.length) {
    console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
    return false;
  }
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if a user has all of the given permissions
 */
export function hasAllPermissions(
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean {
  if (!userRole) return false;
  const userPermissions = getRolePermissions(userRole);
  if (!userPermissions.length) {
    console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
    return false;
  }
  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
}
```

### Route Protection

Routes are protected using a permission map:

```typescript
export const routePermissions: Record<string, Permission | null> = {
  "/": null, // Public route
  "/auth/login": null, // Public route
  "/auth/register": null, // Public route
  "/docs": null, // Public route
  "/profile": null, // Available to all authenticated users
  "/agent": "view:availability",
  "/agent/availability": "edit:availability",
  "/availability": "view:availability",
  "/availability/team": "view:users",
  "/users": "view:users",
  "/admin": "view:admin",
  // Add more routes with their required permissions
};

export function canAccessRoute(
  userRole: UserRole | undefined,
  route: string,
): boolean {
  // If the route isn't in our permissions map, deny access by default
  if (!(route in routePermissions)) return false;

  // If the route has null permission, it's public
  const requiredPermission = routePermissions[route];
  if (requiredPermission === null) return true;

  // Otherwise, check if the user has the required permission
  return hasPermission(userRole, requiredPermission);
}
```

## 4. React Hooks for Client-Side Authorization

### useAuth Hook

The `useAuth` hook manages authentication state:

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Functions for login, logout, and session management
  // ...

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
}
```

### useAuthorization Hook

The `useAuthorization` hook provides permission checking:

```typescript
export function useAuthorization() {
  const { user } = useAuth();
  const userRole = user?.role as UserRole | undefined;

  return {
    userRole,

    checkPermission: (permission: Permission) => {
      return hasPermission(userRole, permission);
    },

    checkAnyPermission: (permissions: Permission[]) => {
      return hasAnyPermission(userRole, permissions);
    },

    checkAllPermissions: (permissions: Permission[]) => {
      return hasAllPermissions(userRole, permissions);
    },

    isAtLeastRole: (role: UserRole) => {
      const roleOrder = {
        [USER_ROLES.USER]: 0,
        [USER_ROLES.BRAND_AGENT]: 1,
        [USER_ROLES.MANAGER]: 2,
        [USER_ROLES.ADMIN]: 3,
      };

      if (!userRole) return false;
      return roleOrder[userRole] >= roleOrder[role];
    },

    canAccessRoute: (route: string) => {
      return canAccessRoute(userRole, route);
    },
  };
}
```

## 5. Middleware Implementation

The `middleware.ts` file protects routes at the server level:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuth } from "./app/lib/auth";
import { canAccessRoute } from "./app/lib/rbac";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Check if this is a public route
  if (["/auth/login", "/auth/register", "/"].includes(path)) {
    return NextResponse.next();
  }

  // Verify authentication and get user role
  const { authenticated, user } = await verifyAuth(request);

  if (!authenticated) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if the user has permission to access this route
  if (!canAccessRoute(user.role, path)) {
    // Redirect to unauthorized page or homepage
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // User is authenticated and authorized, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add routes that should be protected by the middleware
    "/agent/:path*",
    "/admin/:path*",
    "/users/:path*",
    "/availability/:path*",
    // Exclude static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

## 6. Permission Components

The `PermissionGuard` component conditionally renders content based on permissions:

```tsx
interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  anyPermissions?: Permission[];
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  children,
  permission,
  anyPermissions,
  fallback = null,
}: PermissionGuardProps) {
  const { checkPermission, checkAnyPermission } = useAuthorization();

  // Check for a single permission
  if (permission && checkPermission(permission)) {
    return <>{children}</>;
  }

  // Check for any of the provided permissions
  if (
    anyPermissions &&
    anyPermissions.length > 0 &&
    checkAnyPermission(anyPermissions)
  ) {
    return <>{children}</>;
  }

  // If neither permission check passes, render the fallback or null
  return <>{fallback}</>;
}
```

## Recent Improvements

Our RBAC system has been enhanced with several key improvements:

1. **Type Consistency**: Now properly imports and uses the shared `UserRole` type from the schema

   ```typescript
   import { UserRole as SchemaUserRole } from "../../shared/schema";
   export type UserRole = SchemaUserRole;
   ```

2. **Safe Role Permission Access**: Added a helper function for safer access to role permissions

   ```typescript
   function getRolePermissions(role: UserRole | undefined): Permission[] {
     if (!role) return [];
     return rolePermissions[role] || [];
   }
   ```

3. **Undefined Role Handling**: All permission functions now properly handle undefined roles and missing role mappings

   ```typescript
   if (!userRole) return false;
   const rolePerms = getRolePermissions(userRole);
   if (!rolePerms.length) {
     console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
     return false;
   }
   ```

4. **Expanded Role Support**: The rolePermissions mapping now includes all roles defined in the schema

5. **Improved Error Logging**: Added contextual error messages when permission checks fail

## Best Practices

1. **Always Check for Undefined Values**: Never assume a user role will be defined

   ```typescript
   // Incorrect
   const permissions = rolePermissions[userRole];

   // Correct
   if (!userRole) return false;
   const permissions = getRolePermissions(userRole);
   ```

2. **Use Helper Functions**: Use the provided helper functions instead of direct access to role permissions

   ```typescript
   // Incorrect
   return rolePermissions[userRole].includes(permission);

   // Correct
   return hasPermission(userRole, permission);
   ```

3. **Default to Denied Access**: When in doubt, default to denying access rather than allowing it

4. **Add New Roles Carefully**: When adding new roles to the schema, ensure they're also added to the RBAC system

   ```typescript
   // Add to rolePermissions when creating a new role
   [USER_ROLES.NEW_ROLE]: ['permission1', 'permission2'],
   ```

5. **Keep Permissions Granular**: Define specific, granular permissions rather than broad ones

   ```typescript
   // Too broad
   "manage:users";

   // Better - granular permissions
   "view:users", "create:users", "edit:users", "delete:users";
   ```

## Troubleshooting

Common issues related to authentication and permissions:

1. **"Cannot read property of undefined" Errors**: Usually indicates a missing role check. Ensure all permission functions first check if the role is defined.

2. **Users Getting Access Denied Unexpectedly**: Check if the role exists in the `rolePermissions` mapping and has the required permissions.

3. **JWT Validation Failures**: Check that the JWT secret is consistent across environments and that the token is not expired.

4. **Missing Role in Permissions Mapping**: If you see warnings about a role not found in rolePermissions, add the role to the mapping:
   ```typescript
   // Add the missing role to rolePermissions in rbac.ts
   [USER_ROLES.MISSING_ROLE]: ['permission1', 'permission2'],
   ```

## Security Considerations

1. **Defense in Depth**: The RBAC system implements authorization checks at multiple levels:

   - UI level (conditional rendering)
   - Client-side routing (navigation guards)
   - API level (endpoint protection)
   - Database level (query filters)

2. **JWT Security**:

   - Short expiration times
   - HTTP-only cookies
   - CSRF protection
   - Proper signing with strong keys

3. **Principle of Least Privilege**:
   - Users are assigned the minimum permissions needed
   - Fine-grained permission definitions

## Future Enhancements

1. **Custom Role Definitions**: Allow administrators to create custom roles
2. **Permission Groups**: Group related permissions for easier management
3. **Audit Logging**: Track permission checks and authorization decisions
4. **Dynamic Permission Updates**: Allow updating permissions without redeployment
5. **Resource-Level Permissions**: Add permissions for specific resource instances
