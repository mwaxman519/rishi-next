# Authentication and Role-Based Access Control (RBAC) System

This document is a comprehensive overview of the authentication and role-based access control system, merging multiple documentation sources.

This document provides an overview of the authentication and role-based access control (RBAC) system used in the application, including critical error handling and best practices.
The application uses a JWT-based authentication system with role-based access control. This allows different user types to have appropriate access to features and routes based on their assigned role and corresponding permissions.

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

The RBAC system defines:

- Permission types (string literals like 'view:users', 'edit:system')
- Role-permission mappings for each user role
- Helper functions to check permissions
- Route access control configuration

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

1. User credentials are validated against the database
2. Upon successful authentication, a JWT token is generated with user info including role
3. The token is stored in an HTTP-only cookie
4. For subsequent requests, the middleware extracts and validates the token
5. The user's role and permissions are checked for each protected route
   Routes are protected using a combination of:
6. Middleware that validates JWT tokens
7. The `canAccessRoute` function that checks if a user has permission to access a specific route
8. Client-side hooks that restrict UI elements based on permissions
   Recent improvements to the RBAC system include:
9. **Proper Type Imports**: Using the `UserRole` type directly from the schema for consistency
   ```typescript
   import { UserRole as SchemaUserRole } from "../../shared/schema";
   export type UserRole = SchemaUserRole;
   ```
10. **Safe Role Permission Access**: A new helper function provides safe access to role permissions
    ```typescript
    function getRolePermissions(role: UserRole | undefined): Permission[] {
      if (!role) return [];
      return rolePermissions[role] || [];
    }
    ```
11. **Undefined Role Handling**: All permission functions now properly handle undefined roles
    ```typescript
    if (!userRole) return false;
    ```
12. **Missing Role Mapping Handling**: The system now gracefully handles cases where a role exists in the schema but not in the permissions mapping
    ```typescript
    if (!rolePerms.length) {
      console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
      return false;
    }
    ```
13. **Type Assertions for Index Access**: Using appropriate type assertions to avoid TypeScript errors
    ```typescript
    const rolePerms = rolePermissions[userRole as string] || [];
    ```
14. **Always Check for Undefined Values**: Never assume a user role will be defined
15. **Use Helper Functions**: Use the provided helper functions instead of direct access to role permissions
16. **Default to Denied Access**: When in doubt, default to denying access rather than allowing it
17. **Add New Roles Carefully**: When adding new roles to the schema, ensure they're also added to the RBAC system
18. **Keep Permissions Granular**: Define specific, granular permissions rather than broad ones
19. **Log Access Denials**: Log instances where access is denied for auditing purposes
    Common issues related to authentication and permissions:
20. **"Cannot read property of undefined" Errors**: Usually indicates a missing role check. Ensure all permission functions first check if the role is defined.
21. **Users Getting Access Denied Unexpectedly**: Check if the role exists in the `rolePermissions` mapping and has the required permissions.
22. **JWT Validation Failures**: Check that the JWT secret is consistent across environments and that the token is not expired.

## Additional Information

This document provides an overview of the authentication and role-based access control (RBAC) system used in the application, including critical error handling and best practices.
The application uses a JWT-based authentication system with role-based access control. This allows different user types to have appropriate access to features and routes based on their assigned role and corresponding permissions.

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

The RBAC system defines:

- Permission types (string literals like 'view:users', 'edit:system')
- Role-permission mappings for each user role
- Helper functions to check permissions
- Route access control configuration

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

1. User credentials are validated against the database
2. Upon successful authentication, a JWT token is generated with user info including role
3. The token is stored in an HTTP-only cookie
4. For subsequent requests, the middleware extracts and validates the token
5. The user's role and permissions are checked for each protected route
   Routes are protected using a combination of:
6. Middleware that validates JWT tokens
7. The `canAccessRoute` function that checks if a user has permission to access a specific route
8. Client-side hooks that restrict UI elements based on permissions
   Recent improvements to the RBAC system include:
9. **Proper Type Imports**: Using the `UserRole` type directly from the schema for consistency
   ```typescript
   import { UserRole as SchemaUserRole } from "../../shared/schema";
   export type UserRole = SchemaUserRole;
   ```
10. **Safe Role Permission Access**: A new helper function provides safe access to role permissions
    ```typescript
    function getRolePermissions(role: UserRole | undefined): Permission[] {
      if (!role) return [];
      return rolePermissions[role] || [];
    }
    ```
11. **Undefined Role Handling**: All permission functions now properly handle undefined roles
    ```typescript
    if (!userRole) return false;
    ```
12. **Missing Role Mapping Handling**: The system now gracefully handles cases where a role exists in the schema but not in the permissions mapping
    ```typescript
    if (!rolePerms.length) {
      console.warn(`Role '${userRole}' not found in rolePermissions mapping`);
      return false;
    }
    ```
13. **Type Assertions for Index Access**: Using appropriate type assertions to avoid TypeScript errors
    ```typescript
    const rolePerms = rolePermissions[userRole as string] || [];
    ```
14. **Always Check for Undefined Values**: Never assume a user role will be defined
15. **Use Helper Functions**: Use the provided helper functions instead of direct access to role permissions
16. **Default to Denied Access**: When in doubt, default to denying access rather than allowing it
17. **Add New Roles Carefully**: When adding new roles to the schema, ensure they're also added to the RBAC system
18. **Keep Permissions Granular**: Define specific, granular permissions rather than broad ones
19. **Log Access Denials**: Log instances where access is denied for auditing purposes
    Common issues related to authentication and permissions:
20. **"Cannot read property of undefined" Errors**: Usually indicates a missing role check. Ensure all permission functions first check if the role is defined.
21. **Users Getting Access Denied Unexpectedly**: Check if the role exists in the `rolePermissions` mapping and has the required permissions.
22. **JWT Validation Failures**: Check that the JWT secret is consistent across environments and that the token is not expired.
