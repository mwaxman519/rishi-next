/**
 * RBAC Feature Definitions
 *
 * This file defines the system's permission features and scopes, organized by resource type.
 * Features are used to build the core permission structure that's used by the RBAC system.
 */

// Feature and FeatureOperation interfaces for the RBAC dashboard
export interface Feature {
  id: string;
  name: string;
  description: string;
  operations: FeatureOperation[];
  subFeatures?: Feature[];
  service: string;
  route?: string;
}

export interface FeatureOperation {
  id: string;
  name: string;
  description: string;
  permission: string;
}

// Resource types in the system
export const RESOURCE_TYPES = {
  SYSTEM: "system",
  USER: "user",
  ORGANIZATION: "organization",
  CLIENT: "client",
  EVENT: "event",
  AGENT: "agent",
  KIT: "kit",
  DISPENSARY: "dispensary",
  REPORT: "report",
  SCHEDULE: "schedule",
  MARKETING: "marketing",
  DASHBOARD: "dashboard",
  PROFILE: "profile",
  ROLE: "role",
  AUDIT: "audit",
  NOTIFICATION: "notification",
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

// Action types available on resources
export const ACTION_TYPES = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  ASSIGN: "assign",
  APPROVE: "approve",
  EXPORT: "export",
  IMPORT: "import",
} as const;

export type ActionType = (typeof ACTION_TYPES)[keyof typeof ACTION_TYPES];

// Permission scopes that determine boundaries
export const PERMISSION_SCOPES = {
  ALL: "all", // Access to all items of a resource type
  ASSIGNED: "assigned", // Access to items assigned to the user
  OWNED: "owned", // Access to items owned/created by the user
  ORGANIZATION: "organization", // Access to items within the user's current organization
  REGION: "region", // Access to items within the user's assigned regions
} as const;

export type PermissionScope =
  (typeof PERMISSION_SCOPES)[keyof typeof PERMISSION_SCOPES];

/**
 * Permission feature consisting of action + resource + optional scope
 * Format: action:resource[:scope]
 * Examples: "view:users", "manage:events:organization", "approve:reports:assigned"
 */
export interface PermissionFeature {
  action: ActionType;
  resource: ResourceType | "all"; // Allow 'all' as a special resource type
  scope?: PermissionScope | undefined;
}

/**
 * Convert a permission feature to string format
 */
export function featureToString(feature: PermissionFeature): string {
  if (feature.scope) {
    return `${feature.action}:${feature.resource}:${feature.scope}`;
  }
  return `${feature.action}:${feature.resource}`;
}

/**
 * Parse a permission string into a feature object
 */
export function parseFeature(permission: string): PermissionFeature {
  const parts = permission.split(":");

  if (parts.length < 2) {
    throw new Error(`Invalid permission format: ${permission}`);
  }

  const action = parts[0] as ActionType;
  const resource = parts[1] as ResourceType;
  const scope = parts[2] as PermissionScope | undefined;

  return { action, resource, scope };
}

/**
 * Check if a permission covers another permission
 * For example, "view:all" covers "view:users"
 * "manage:users" covers "view:users", "create:users", etc.
 */
export function permissionCovers(
  coveringPermission: string,
  targetPermission: string,
): boolean {
  // Direct match
  if (coveringPermission === targetPermission) return true;

  const covering = parseFeature(coveringPermission);
  const target = parseFeature(targetPermission);

  // All resource wildcard
  if (covering.resource === "all" && covering.action === target.action) {
    return true;
  }

  // Manage action implies other actions on same resource
  if (
    covering.action === "manage" &&
    covering.resource === target.resource &&
    ["view", "create", "update", "delete"].includes(target.action)
  ) {
    // If covering permission has a scope, target must match or be more restrictive
    if (covering.scope) {
      if (!target.scope) return false; // Target must have scope if covering has scope

      // Organization scope covers organization, owned, and assigned
      if (covering.scope === PERMISSION_SCOPES.ORGANIZATION) {
        return [
          PERMISSION_SCOPES.ORGANIZATION,
          PERMISSION_SCOPES.OWNED,
          PERMISSION_SCOPES.ASSIGNED,
        ].includes(target.scope as any);
      }

      // Region scope covers region, owned, and assigned
      if (covering.scope === PERMISSION_SCOPES.REGION) {
        return [
          PERMISSION_SCOPES.REGION,
          PERMISSION_SCOPES.OWNED,
          PERMISSION_SCOPES.ASSIGNED,
        ].includes(target.scope as any);
      }

      // Owned scope covers only owned and assigned
      if (covering.scope === PERMISSION_SCOPES.OWNED) {
        return [PERMISSION_SCOPES.OWNED, PERMISSION_SCOPES.ASSIGNED].includes(
          target.scope as any,
        );
      }

      // Assigned scope covers only assigned
      if (covering.scope === PERMISSION_SCOPES.ASSIGNED) {
        return target.scope === PERMISSION_SCOPES.ASSIGNED;
      }

      // All scope covers everything
      if (covering.scope === PERMISSION_SCOPES.ALL) {
        return true;
      }
    } else {
      // No scope on covering permission means it's global
      return true;
    }
  }

  // Same action and resource, check scopes
  if (
    covering.action === target.action &&
    covering.resource === target.resource
  ) {
    // If covering has no scope, it covers all scopes
    if (!covering.scope) return true;

    // If target has no scope but covering does, covering doesn't cover target
    if (!target.scope) return false;

    // Check scope hierarchy
    if (covering.scope === PERMISSION_SCOPES.ALL) {
      return true; // ALL covers everything
    }

    if (covering.scope === PERMISSION_SCOPES.ORGANIZATION) {
      return [
        PERMISSION_SCOPES.ORGANIZATION,
        PERMISSION_SCOPES.OWNED,
        PERMISSION_SCOPES.ASSIGNED,
      ].includes(target.scope as any);
    }

    if (covering.scope === PERMISSION_SCOPES.REGION) {
      return [
        PERMISSION_SCOPES.REGION,
        PERMISSION_SCOPES.OWNED,
        PERMISSION_SCOPES.ASSIGNED,
      ].includes(target.scope as any);
    }

    if (covering.scope === PERMISSION_SCOPES.OWNED) {
      return [PERMISSION_SCOPES.OWNED, PERMISSION_SCOPES.ASSIGNED].includes(
        target.scope as any,
      );
    }

    if (covering.scope === PERMISSION_SCOPES.ASSIGNED) {
      return target.scope === PERMISSION_SCOPES.ASSIGNED;
    }
  }

  return false;
}

// Define services for features organization
export const Services = {
  CORE: "Core",
  USER_MANAGEMENT: "User Management",
  FIELD_OPERATIONS: "Field Operations",
  EVENT_MANAGEMENT: "Event Management",
  INVENTORY: "Inventory",
  CLIENT_MANAGEMENT: "Client Management",
  REPORTING: "Reporting",
  MARKETING: "Marketing",
};

// Helper to create standard CRUD operations for a feature
function createStandardOperations(resource: string): FeatureOperation[] {
  return [
    {
      id: "view",
      name: "View",
      description: `View ${resource}`,
      permission: `view:${resource}`,
    },
    {
      id: "create",
      name: "Create",
      description: `Create ${resource}`,
      permission: `create:${resource}`,
    },
    {
      id: "update",
      name: "Update",
      description: `Update ${resource}`,
      permission: `update:${resource}`,
    },
    {
      id: "delete",
      name: "Delete",
      description: `Delete ${resource}`,
      permission: `delete:${resource}`,
    },
  ];
}

// Application Features definition
export const ApplicationFeatures: Feature[] = [
  // Core features
  {
    id: "dashboard",
    name: "Dashboard",
    description: "System dashboard and overview",
    operations: [
      {
        id: "view",
        name: "View",
        description: "View dashboard",
        permission: "view:dashboard",
      },
    ],
    service: Services.CORE,
    route: "/dashboard",
  },

  // User Management features
  {
    id: "users",
    name: "Users",
    description: "User management",
    operations: [
      ...createStandardOperations("users"),
      {
        id: "assign_role",
        name: "Assign Role",
        description: "Assign roles to users",
        permission: "assign:user_roles",
      },
    ],
    service: Services.USER_MANAGEMENT,
    route: "/users",
  },

  // Role Management
  {
    id: "roles",
    name: "Roles & Permissions",
    description: "Role and permission management",
    operations: [
      ...createStandardOperations("roles"),
      {
        id: "assign_permission",
        name: "Assign Permission",
        description: "Assign permissions to roles",
        permission: "assign:role_permissions",
      },
    ],
    service: Services.USER_MANAGEMENT,
    route: "/admin/rbac",
  },

  // Organizations
  {
    id: "organizations",
    name: "Organizations",
    description: "Organization management",
    operations: [
      ...createStandardOperations("organizations"),
      {
        id: "assign_users",
        name: "Assign Users",
        description: "Assign users to organizations",
        permission: "assign:organization_users",
      },
    ],
    service: Services.USER_MANAGEMENT,
    route: "/organizations",
  },

  // Events
  {
    id: "events",
    name: "Events",
    description: "Event management",
    operations: [
      ...createStandardOperations("events"),
      {
        id: "approve",
        name: "Approve",
        description: "Approve events",
        permission: "approve:events",
      },
      {
        id: "assign_agents",
        name: "Assign Agents",
        description: "Assign agents to events",
        permission: "assign:event_agents",
      },
    ],
    service: Services.EVENT_MANAGEMENT,
    route: "/bookings",
  },

  // Brand Agents
  {
    id: "agents",
    name: "Brand Agents",
    description: "Brand agent management",
    operations: [
      ...createStandardOperations("agents"),
      {
        id: "assign_schedule",
        name: "Assign Schedule",
        description: "Assign schedules to agents",
        permission: "assign:agent_schedules",
      },
    ],
    service: Services.FIELD_OPERATIONS,
    route: "/agents",
  },

  // Reporting
  {
    id: "reports",
    name: "Reports",
    description: "Reporting and analytics",
    operations: [
      ...createStandardOperations("reports"),
      {
        id: "export",
        name: "Export",
        description: "Export reports",
        permission: "export:reports",
      },
    ],
    service: Services.REPORTING,
    route: "/reports",
  },
];

/**
 * Get all application features
 */
export function getAllFeatures(): Feature[] {
  return ApplicationFeatures;
}
