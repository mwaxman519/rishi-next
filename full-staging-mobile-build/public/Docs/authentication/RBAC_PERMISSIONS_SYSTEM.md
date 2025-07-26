# RBAC Permissions System - Updated Implementation

## Overview

The Rishi Platform implements a comprehensive Role-Based Access Control (RBAC) system with granular permissions, supporting the new inventory/kit management system and following the prescribed Next.js serverless + microservices + event bus architecture.

## Role Hierarchy

### 1. Super Admin
**Role**: `super_admin`
**Permissions**: All permissions (`["*"]`)
**Access Level**: Platform-wide administration
**Key Responsibilities**:
- System administration
- Organization management
- User management across all organizations
- All inventory and kit operations

### 2. Internal Admin
**Role**: `internal_admin`
**Permissions**: `["create:*", "read:*", "update:*", "delete:*"]`
**Access Level**: Rishi internal operations
**Key Responsibilities**:
- Rishi internal operations
- Client organization management
- Kit template approvals
- Inventory management

### 3. Internal Field Manager
**Role**: `internal_field_manager`
**Permissions**: `["create:bookings", "read:*", "update:bookings", "update:staff", "manage:kits", "approve:replenishment"]`
**Access Level**: Regional field operations
**Key Responsibilities**:
- Regional booking management
- Kit instance deployment
- Staff assignments
- Replenishment approvals

### 4. Brand Agent
**Role**: `brand_agent`
**Permissions**: `["read:bookings", "read:staff", "update:profile", "log:consumption", "view:kit-instances"]`
**Access Level**: Field operations
**Key Responsibilities**:
- Execute bookings
- Log consumption
- Update kit status
- Report issues

### 5. Client Manager
**Role**: `client_manager`
**Permissions**: `["create:bookings", "read:bookings", "update:bookings", "read:staff", "view:kit-templates", "request:replenishment"]`
**Access Level**: Client organization management
**Key Responsibilities**:
- Create and manage bookings
- View kit templates
- Request replenishment
- Manage client staff

### 6. Client User
**Role**: `client_user`
**Permissions**: `["read:bookings", "read:staff", "update:profile", "view:kit-templates"]`
**Access Level**: Basic client access
**Key Responsibilities**:
- View bookings
- View staff assignments
- View kit templates

## Permission Structure

### Core Permissions
```typescript
// System Administration
"manage:system"           // System-wide administration
"manage:organizations"    // Organization CRUD operations
"manage:users"           // User management
"admin:all"              // All admin operations

// Organization Management
"create:organizations"    // Create new organizations
"read:organizations"      // View organization details
"update:organizations"    // Modify organization settings
"delete:organizations"    // Remove organizations

// User Management
"create:users"           // Create new users
"read:users"            // View user information
"update:users"          // Modify user details
"delete:users"          // Remove users
"assign:roles"          // Assign roles to users

// Booking Management
"create:bookings"        // Create new bookings
"read:bookings"         // View booking details
"update:bookings"       // Modify bookings
"delete:bookings"       // Cancel bookings
"approve:bookings"      // Approve pending bookings

// Staff Management
"read:staff"            // View staff information
"update:staff"          // Modify staff assignments
"assign:staff"          // Assign staff to bookings
"manage:staff"          // Full staff management

// Location Management
"create:locations"       // Add new locations
"read:locations"        // View location details
"update:locations"      // Modify location information
"delete:locations"      // Remove locations
```

### NEW: Inventory & Kit Permissions
```typescript
// Inventory Management
"create:inventory"           // Create inventory items
"read:inventory"            // View inventory
"update:inventory"          // Modify inventory
"delete:inventory"          // Remove inventory items
"manage:inventory"          // Full inventory management

// Kit Template Management
"create:kit-templates"      // Create kit templates
"read:kit-templates"        // View kit templates
"update:kit-templates"      // Modify kit templates
"delete:kit-templates"      // Remove kit templates
"approve:kit-templates"     // Approve kit templates

// Kit Instance Management
"create:kit-instances"      // Deploy kit instances
"read:kit-instances"        // View kit instances
"update:kit-instances"      // Modify kit instances
"delete:kit-instances"      // Remove kit instances
"assign:kit-instances"      // Assign kits to users
"manage:kits"              // Full kit management

// Consumption Tracking
"log:consumption"          // Log consumption events
"view:consumption-logs"    // View consumption history
"manage:consumption"       // Full consumption management

// Replenishment System
"create:replenishment-requests"    // Create replenishment requests
"view:replenishment-requests"      // View replenishment requests
"approve:replenishment-requests"   // Approve replenishment requests
"complete:replenishment-requests"  // Complete replenishment requests
"request:replenishment"           // Request replenishment (client)

// Analytics & Reporting
"view:analytics"           // View analytics dashboards
"view:reports"            // View system reports
"export:data"             // Export data
```

## Implementation

### 1. Permission Constants
```typescript
// shared/schema.ts
export const PERMISSIONS = {
  // System
  MANAGE_SYSTEM: "manage:system",
  MANAGE_ORGANIZATIONS: "manage:organizations",
  MANAGE_USERS: "manage:users",
  ADMIN_ALL: "admin:all",
  
  // Organizations
  CREATE_ORGANIZATIONS: "create:organizations",
  READ_ORGANIZATIONS: "read:organizations",
  UPDATE_ORGANIZATIONS: "update:organizations",
  DELETE_ORGANIZATIONS: "delete:organizations",
  
  // Inventory & Kits
  CREATE_INVENTORY: "create:inventory",
  READ_INVENTORY: "read:inventory",
  UPDATE_INVENTORY: "update:inventory",
  MANAGE_INVENTORY: "manage:inventory",
  
  CREATE_KIT_TEMPLATES: "create:kit-templates",
  READ_KIT_TEMPLATES: "read:kit-templates",
  APPROVE_KIT_TEMPLATES: "approve:kit-templates",
  
  CREATE_KIT_INSTANCES: "create:kit-instances",
  READ_KIT_INSTANCES: "read:kit-instances",
  ASSIGN_KIT_INSTANCES: "assign:kit-instances",
  MANAGE_KITS: "manage:kits",
  
  LOG_CONSUMPTION: "log:consumption",
  VIEW_CONSUMPTION_LOGS: "view:consumption-logs",
  
  CREATE_REPLENISHMENT_REQUESTS: "create:replenishment-requests",
  APPROVE_REPLENISHMENT_REQUESTS: "approve:replenishment-requests",
  REQUEST_REPLENISHMENT: "request:replenishment",
  
  // Analytics
  VIEW_ANALYTICS: "view:analytics",
  VIEW_REPORTS: "view:reports",
  EXPORT_DATA: "export:data",
} as const;
```

### 2. Updated Role Permissions
```typescript
// shared/schema.ts
export const rolePermissions = {
  super_admin: ["*"],
  internal_admin: [
    "create:*", "read:*", "update:*", "delete:*",
    "manage:system", "manage:organizations", "manage:users",
    "manage:inventory", "manage:kits", "approve:kit-templates",
    "approve:replenishment-requests", "view:analytics", "export:data"
  ],
  internal_field_manager: [
    "create:bookings", "read:*", "update:bookings", "update:staff",
    "manage:kits", "create:kit-instances", "assign:kit-instances",
    "approve:replenishment-requests", "view:consumption-logs",
    "view:analytics"
  ],
  brand_agent: [
    "read:bookings", "read:staff", "update:profile",
    "read:kit-instances", "log:consumption", "view:kit-templates",
    "create:replenishment-requests"
  ],
  client_manager: [
    "create:bookings", "read:bookings", "update:bookings", "read:staff",
    "read:kit-templates", "request:replenishment", "view:analytics"
  ],
  client_user: [
    "read:bookings", "read:staff", "update:profile",
    "read:kit-templates"
  ]
} as const;
```

### 3. Permission Checking Utility
```typescript
// lib/auth/permissions.ts
import { PERMISSIONS } from '@shared/schema';

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Direct permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Wildcard permission match (e.g., "create:*" allows "create:bookings")
  const [action, resource] = requiredPermission.split(':');
  const wildcardPermission = `${action}:*`;
  if (userPermissions.includes(wildcardPermission)) {
    return true;
  }
  
  return false;
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
}
```

### 4. Enhanced PermissionGuard Component
```typescript
// app/components/rbac/PermissionGuard.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { hasPermission, hasAnyPermission } from '@/lib/auth/permissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return fallback;
  }
  
  const userPermissions = user.permissions || [];
  
  // Single permission check
  if (permission && !hasPermission(userPermissions, permission)) {
    return fallback;
  }
  
  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? permissions.every(p => hasPermission(userPermissions, p))
      : permissions.some(p => hasPermission(userPermissions, p));
    
    if (!hasAccess) {
      return fallback;
    }
  }
  
  return <>{children}</>;
}
```

### 5. API Route Protection
```typescript
// server/middleware/auth.ts
import { NextRequest } from 'next/server';
import { hasPermission } from '@/lib/auth/permissions';

export function requirePermission(permission: string) {
  return async (request: NextRequest) => {
    const user = await isAuthenticated(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401 }
      );
    }
    
    const userPermissions = user.permissions || [];
    
    if (!hasPermission(userPermissions, permission)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }), 
        { status: 403 }
      );
    }
    
    return null; // Allow access
  };
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const authCheck = await requirePermission('read:inventory')(request);
  if (authCheck) return authCheck;
  
  // API logic here
}
```

## Authentication Flow

### 1. Login Process
```typescript
// app/api/auth-service/login/route.ts
export async function POST(request: Request) {
  const { username, password } = await request.json();
  
  // Authenticate user
  const user = await AuthService.authenticate(username, password);
  
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Get user permissions based on role
  const permissions = await PermissionService.getUserPermissions(user.id, user.role);
  
  // Create JWT token
  const token = await createJWT({
    userId: user.id,
    role: user.role,
    permissions,
    organizationId: user.organizationId
  });
  
  // Set secure cookie
  const response = Response.json({ 
    user: { ...user, permissions },
    success: true 
  });
  
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  
  return response;
}
```

### 2. Permission Service
```typescript
// server/services/PermissionService.ts
import { rolePermissions } from '@shared/schema';

export class PermissionService {
  static async getUserPermissions(userId: string, role: string): Promise<string[]> {
    // Get base permissions from role
    const basePermissions = rolePermissions[role] || [];
    
    // TODO: Add user-specific permissions from database
    // const userSpecificPermissions = await this.getUserSpecificPermissions(userId);
    
    return basePermissions;
  }
  
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await UserService.getById(userId);
    const permissions = await this.getUserPermissions(userId, user.role);
    
    return hasPermission(permissions, permission);
  }
}
```

### 3. Organization Context
```typescript
// app/providers/OrganizationProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading && user) {
      // Set default organization for super admin
      if (user.role === 'super_admin') {
        setCurrentOrganization({
          id: 'rishi-internal',
          name: 'Rishi Internal',
          type: 'internal'
        });
      }
      setIsLoading(false);
    }
  }, [user, authLoading]);
  
  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      setCurrentOrganization,
      isLoading
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
```

## Navigation Permission Integration

### Navigation Item Structure
```typescript
// shared/navigation-structure.tsx
interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  type?: "item" | "section";
  children?: NavItem[];
}

// Example navigation with new permissions
export const superAdminNavigation: NavItem[] = [
  {
    href: "/admin/organizations",
    label: "Organizations",
    icon: <Building className="h-5 w-5" />,
    permission: "manage:organizations"
  },
  {
    href: "/inventory",
    label: "Inventory Management",
    icon: <Package className="h-5 w-5" />,
    permission: "manage:inventory",
    children: [
      {
        href: "/inventory/items",
        label: "Items",
        icon: <Package className="h-4 w-4" />,
        permission: "read:inventory"
      },
      {
        href: "/inventory/kit-templates",
        label: "Kit Templates",
        icon: <FileText className="h-4 w-4" />,
        permission: "read:kit-templates"
      },
      {
        href: "/inventory/kit-instances",
        label: "Kit Instances",
        icon: <Box className="h-4 w-4" />,
        permission: "read:kit-instances"
      },
      {
        href: "/inventory/replenishment",
        label: "Replenishment",
        icon: <RefreshCw className="h-4 w-4" />,
        permission: "view:replenishment-requests"
      }
    ]
  }
];
```

### Navigation Filtering
```typescript
// app/components/navigation/NavigationFilter.tsx
import { hasPermission } from '@/lib/auth/permissions';

export function filterNavItems(items: NavItem[], userPermissions: string[]): NavItem[] {
  return items.filter(item => {
    // No permission required - show item
    if (!item.permission && !item.permissions) {
      return true;
    }
    
    // Single permission check
    if (item.permission && !hasPermission(userPermissions, item.permission)) {
      return false;
    }
    
    // Multiple permissions check
    if (item.permissions && item.permissions.length > 0) {
      const hasAccess = item.requireAll 
        ? item.permissions.every(p => hasPermission(userPermissions, p))
        : item.permissions.some(p => hasPermission(userPermissions, p));
      
      if (!hasAccess) {
        return false;
      }
    }
    
    // Filter children recursively
    if (item.children) {
      item.children = filterNavItems(item.children, userPermissions);
    }
    
    return true;
  });
}
```

## Testing Strategy

### Permission Testing
```typescript
// tests/auth/permissions.test.ts
import { hasPermission } from '@/lib/auth/permissions';

describe('Permission System', () => {
  it('should allow super admin all permissions', () => {
    const superAdminPermissions = ['*'];
    expect(hasPermission(superAdminPermissions, 'manage:organizations')).toBe(true);
    expect(hasPermission(superAdminPermissions, 'create:inventory')).toBe(true);
  });
  
  it('should allow wildcard permissions', () => {
    const adminPermissions = ['create:*', 'read:*'];
    expect(hasPermission(adminPermissions, 'create:bookings')).toBe(true);
    expect(hasPermission(adminPermissions, 'create:inventory')).toBe(true);
    expect(hasPermission(adminPermissions, 'delete:bookings')).toBe(false);
  });
  
  it('should deny access without permission', () => {
    const userPermissions = ['read:bookings'];
    expect(hasPermission(userPermissions, 'create:bookings')).toBe(false);
    expect(hasPermission(userPermissions, 'manage:inventory')).toBe(false);
  });
});
```

---

**Last Updated**: January 9, 2025
**RBAC Version**: 2.0 (Complete Inventory/Kit System Integration)
**Status**: Production Ready