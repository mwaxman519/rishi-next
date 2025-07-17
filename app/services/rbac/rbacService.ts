/**
 * RBAC Service - Core business logic for Role-Based Access Control
 */
import { RBACRepository } from "./repository";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import {
  Role,
  UserRole,
  OrganizationPermission,
  Permission,
  PermissionScope,
  PermissionCheckParams,
  CreateRoleParams,
  UpdateRoleParams,
  UserRoleParams,
  OrganizationPermissionParams,
} from "./models";

/**
 * Middleware function to check if the current user has a specific permission
 * This is used in API routes to enforce permission-based access control
 */
export async function checkPermission(
  req: NextRequest,
  permission: string,
): Promise<boolean> {
  try {
    // Get the current user from the session
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }
    
    // Get the current organization from the session or headers
    const organizationId = req.headers.get('x-organization-id') || undefined;
    
    // Use the RBAC service to check if the user has the required permission
    const rbacService = new RBACService();
    return await rbacService.hasPermission(user.id, { 
      permission,
      organizationId
    });
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

export class RBACService {
  private repository: RBACRepository;
  private defaultRoles: Record<string, Role>;

  constructor() {
    this.repository = new RBACRepository();
    this.defaultRoles = {}; // Initialize empty, but can be populated with system defaults
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.repository.getAllRoles();
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    return this.repository.getRoleById(id);
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleParams): Promise<Role> {
    return this.repository.createRole(data);
  }

  /**
   * Update an existing role
   */
  async updateRole(id: string, data: UpdateRoleParams): Promise<Role> {
    return this.repository.updateRole(id, data);
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    return this.repository.deleteRole(id);
  }

  /**
   * Get user roles
   */
  async getUserRoles(
    userId: string,
    organizationId?: string,
  ): Promise<UserRole[]> {
    return this.repository.getUserRoles(userId, organizationId);
  }

  /**
   * Get user permissions based on their roles
   */
  async getUserPermissions(
    userId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    // Get the user's roles
    const userRoles = await this.getUserRoles(userId, organizationId);

    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    // Get the full role information for each role ID
    const rolePromises = userRoles.map((userRole) =>
      this.getRoleById(userRole.roleId),
    );
    const roles = await Promise.all(rolePromises);

    // Filter out any null values and extract permissions
    const validRoles = roles.filter(Boolean) as Role[];

    // Create a unique set of permissions from all roles
    const permissionSet = new Set<Permission>();
    validRoles.forEach((role) => {
      role.permissions.forEach((permission) => permissionSet.add(permission));
    });

    // If the user has a role in this org, also get any org-specific permissions
    if (organizationId) {
      const orgPermissions =
        await this.getOrganizationPermissions(organizationId);

      // Add granted permissions, remove non-granted ones
      orgPermissions.forEach((orgPerm) => {
        if (orgPerm.isGranted) {
          permissionSet.add(orgPerm.permission);
        } else {
          permissionSet.delete(orgPerm.permission);
        }
      });
    }

    return Array.from(permissionSet);
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    userId: string,
    params: PermissionCheckParams,
  ): Promise<boolean> {
    // Get organization ID from params
    const { permission, organizationId } = params;

    // First, check if the user has this permission directly
    const userPermissions = await this.getUserPermissions(
      userId,
      organizationId,
    );

    // Extract the parts of the permission
    const [action, resource, scope] = permission.split(":");

    // Check for direct permission match
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check for wildcard permission (e.g., manage:* would grant manage:users)
    if (userPermissions.includes(`${action}:*`)) {
      return true;
    }

    // Handle scope checks if scope is specified
    if (scope) {
      // If permission has a scope but user has permission without the scope, they have broader access
      if (userPermissions.includes(`${action}:${resource}`)) {
        return true;
      }

      // Handle organization scope
      if (scope === PermissionScope.ORGANIZATION && organizationId) {
        // Check if they have this scoped permission
        if (
          userPermissions.includes(
            `${action}:${resource}:${PermissionScope.ORGANIZATION}`,
          )
        ) {
          return true;
        }
      }

      // Handle owned resources
      if (
        scope === PermissionScope.OWNED &&
        params.resourceOwnerId === userId
      ) {
        if (
          userPermissions.includes(
            `${action}:${resource}:${PermissionScope.OWNED}`,
          )
        ) {
          return true;
        }
      }

      // Handle assigned resources
      if (
        scope === PermissionScope.ASSIGNED &&
        params.resourceAssigneeId === userId
      ) {
        if (
          userPermissions.includes(
            `${action}:${resource}:${PermissionScope.ASSIGNED}`,
          )
        ) {
          return true;
        }
      }

      // Handle region scope (future implementation)
    }

    return false;
  }

  /**
   * Check if a user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: Permission[],
    organizationId?: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(
      userId,
      organizationId,
    );

    return permissions.every((permission) => {
      const [action, resource] = permission.split(":");

      // Check for direct match
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check for wildcard match
      return userPermissions.includes(`${action}:*`);
    });
  }

  /**
   * Check if a user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissions: Permission[],
    organizationId?: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(
      userId,
      organizationId,
    );

    return permissions.some((permission) => {
      const [action, resource] = permission.split(":");

      // Check for direct match
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check for wildcard match
      return userPermissions.includes(`${action}:*`);
    });
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(params: UserRoleParams): Promise<UserRole> {
    return this.repository.assignRoleToUser(params);
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    organizationId?: string,
  ): Promise<void> {
    return this.repository.removeRoleFromUser(userId, roleId, organizationId);
  }

  /**
   * Get organization permissions
   */
  async getOrganizationPermissions(
    organizationId: string,
  ): Promise<OrganizationPermission[]> {
    return this.repository.getOrganizationPermissions(organizationId);
  }

  /**
   * Set organization permission
   */
  async setOrganizationPermission(
    params: OrganizationPermissionParams,
  ): Promise<OrganizationPermission> {
    return this.repository.setOrganizationPermission(params);
  }

  /**
   * Remove organization permission
   */
  async removeOrganizationPermission(
    organizationId: string,
    permission: string,
  ): Promise<void> {
    return this.repository.removeOrganizationPermission(
      organizationId,
      permission,
    );
  }
}
