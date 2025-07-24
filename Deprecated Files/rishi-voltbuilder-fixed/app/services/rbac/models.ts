/**
 * RBAC Service Models
 * These models define the core entities and types for the RBAC system
 */
import { z } from "zod";

/**
 * Permission string type - represents an action on a resource with optional scope
 * Format: action:resource[:scope]
 * Examples:
 * - view:users
 * - create:events
 * - approve:locations:organization
 */
export type Permission = string;

/**
 * Permission scope defines the visibility/access boundary
 */
export enum PermissionScope {
  ALL = "all", // Access to all resources, regardless of ownership
  ORGANIZATION = "organization", // Access limited to current organization
  OWNED = "owned", // Access limited to resources owned by the user
  ASSIGNED = "assigned", // Access limited to resources assigned to the user
  REGION = "region", // Access limited to resources in the user's region
}

/**
 * Role entity representing a collection of permissions
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User role assignment with organization context
 */
export interface UserRole {
  userId: string;
  roleId: string;
  organizationId?: string;
  isDefault?: boolean;
}

/**
 * Permission grant specific to an organization
 */
export interface OrganizationPermission {
  organizationId: string;
  permission: Permission;
  isGranted: boolean;
}

/**
 * Permission check parameters
 */
export interface PermissionCheckParams {
  permission: Permission;
  organizationId?: string;
  resourceOwnerId?: string;
  resourceAssigneeId?: string;
  resourceRegionId?: string;
}

/**
 * Permission validation schema
 */
export const permissionSchema = z
  .string()
  .regex(
    /^[a-z]+:[a-z\-]+(:[a-z]+)?$/,
    "Permission must be in format: action:resource[:scope]",
  );

/**
 * Role creation schema
 */
export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(permissionSchema),
  isSystem: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

/**
 * Role update schema
 */
export const updateRoleSchema = createRoleSchema.partial();

/**
 * User role assignment schema
 */
export const userRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  organizationId: z.string().optional(),
  isDefault: z.boolean().default(false),
});

/**
 * Organization permission schema
 */
export const organizationPermissionSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  permission: permissionSchema,
  isGranted: z.boolean(),
});

// Types derived from schemas
export type CreateRoleParams = z.infer<typeof createRoleSchema>;
export type UpdateRoleParams = z.infer<typeof updateRoleSchema>;
export type UserRoleParams = z.infer<typeof userRoleSchema>;
export type OrganizationPermissionParams = z.infer<
  typeof organizationPermissionSchema
>;
