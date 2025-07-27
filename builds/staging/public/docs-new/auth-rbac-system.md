# Authentication and Role-Based Access Control (RBAC) System

This document provides an overview of the authentication and role-based access control (RBAC) system used in the application, including critical error handling and best practices.

## Overview

The application uses a JWT-based authentication system with role-based access control. This allows different user types to have appropriate access to features and routes based on their assigned role and corresponding permissions.

## Key Components

### 1. Schema Definition (shared/schema.ts)

- User roles are defined as string literals in `USER_ROLES` constant
- The `UserRole` type ensures type safety throughout the application
- The `users` table includes a `role` column that references these roles

```typescript
// Define user roles as an enum for type safety
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

### 2. RBAC System (app/lib/rbac.ts)

The RBAC system defines:

- Permission types (string literals like 'view:users', 'edit:system')
- Role-permission mappings for each user role
- Helper functions to check permissions
- Route access control configuration

#### Core Permission Functions

```typescript
// Safe helper to get role permissions
function getRolePermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return rolePermissions[role] || [];
}

// Check if a user has a specific permission
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
```

### 3. Authentication Flow

1. User credentials are validated against the database
2. Upon successful authentication, a JWT token is generated with user info including role
3. The token is stored in an HTTP-only cookie
4. For subsequent requests, the middleware extracts and validates the token
5. The user's role and permissions are checked for each protected route

### 4. Route Protection

Routes are protected using a combination of:

1. Middleware that validates JWT tokens
2. The `canAccessRoute` function that checks if a user has permission to access a specific route
3. Client-side hooks that restrict UI elements based on permissions

## Recent Fixes and Improvements

### Type Safety and Error Handling

Recent improvements to the RBAC system include:

1. **Proper Type Imports**: Using the `UserRole` type directly from the schema for consistency

   ```typescript
   import { UserRole as SchemaUserRole } from "../../shared/schema";
   export type UserRole = SchemaUserRole;
   ```

2. **Safe Role Permission Access**: A new helper function provides safe access to role permissions

   ```typescript
   function getRolePermissions(role: UserRole | undefined): Permission[] {
     if (!role) return [];
     return rolePermissions[role] || [];
   }
   ```

3. **Undefined Role Handling**: All permission functions now properly handle undefined roles

   ```typescript
   if (!userRole) return false;
   ```

4. **Missing Role Mapping Handling**: The system now gracefully handles cases where a role exists in the schema but not in the permissions mapping

   ```typescript
   if (!rolePerms.length) {
     console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
     return false;
   }
   ```

5. **Type Assertions for Index Access**: Using appropriate type assertions to avoid TypeScript errors
   ```typescript
   const rolePerms = rolePermissions[userRole as string] || [];
   ```

## Best Practices

1. **Always Check for Undefined Values**: Never assume a user role will be defined
2. **Use Helper Functions**: Use the provided helper functions instead of direct access to role permissions
3. **Default to Denied Access**: When in doubt, default to denying access rather than allowing it
4. **Add New Roles Carefully**: When adding new roles to the schema, ensure they're also added to the RBAC system
5. **Keep Permissions Granular**: Define specific, granular permissions rather than broad ones
6. **Log Access Denials**: Log instances where access is denied for auditing purposes

## Troubleshooting

Common issues related to authentication and permissions:

1. **"Cannot read property of undefined" Errors**: Usually indicates a missing role check. Ensure all permission functions first check if the role is defined.

2. **Users Getting Access Denied Unexpectedly**: Check if the role exists in the `rolePermissions` mapping and has the required permissions.

3. **JWT Validation Failures**: Check that the JWT secret is consistent across environments and that the token is not expired.
