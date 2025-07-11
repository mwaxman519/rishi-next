/**
 * RBAC Repository for data access operations
 */
import { db } from "../../server/db";
import { roles, organizationPermissions } from "../../../shared/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import {
  Role,
  UserRole,
  OrganizationPermission,
  CreateRoleParams,
  UpdateRoleParams,
  UserRoleParams,
  OrganizationPermissionParams,
} from "./models";

export class RBACRepository {
  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      // Get all roles from the database
      const result = await db.select().from(roles);
      return result.map(this.mapRoleToDTO);
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error(
        `Failed to fetch roles: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    try {
      const [result] = await db.select().from(roles).where(eq(roles.id, id));

      if (!result) {
        return null;
      }

      return this.mapRoleToDTO(result);
    } catch (error) {
      console.error(`Error fetching role with ID ${id}:`, error);
      throw new Error(
        `Failed to fetch role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRoleParams): Promise<Role> {
    try {
      const [result] = await db
        .insert(roles)
        .values({
          name: data.name,
          description: data.description || "",
          permissions: data.permissions,
          isSystem: data.isSystem,
          isDefault: data.isDefault,
        })
        .returning();

      return this.mapRoleToDTO(result);
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error(
        `Failed to create role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(id: string, data: UpdateRoleParams): Promise<Role> {
    try {
      const [result] = await db
        .update(roles)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(roles.id, id))
        .returning();

      if (!result) {
        throw new Error(`Role with ID ${id} not found`);
      }

      return this.mapRoleToDTO(result);
    } catch (error) {
      console.error(`Error updating role with ID ${id}:`, error);
      throw new Error(
        `Failed to update role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      // Check if the role exists first
      const [role] = await db.select().from(roles).where(eq(roles.id, id));

      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }

      // Check if the role is a system role
      if (role.isSystem) {
        throw new Error(`Cannot delete system role: ${role.name}`);
      }

      // Delete the role
      await db.delete(roles).where(eq(roles.id, id));
    } catch (error) {
      console.error(`Error deleting role with ID ${id}:`, error);
      throw new Error(
        `Failed to delete role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(
    userId: string,
    organizationId?: string,
  ): Promise<UserRole[]> {
    try {
      console.log("DEVELOPMENT MODE: Using mock user roles for testing");

      // In development mode, return mock data instead of querying the database
      // This is a temporary solution until we have the userRoles table properly set up
      return [
        {
          userId: userId,
          roleId: "1", // admin role
          organizationId: organizationId,
          isDefault: true,
        },
      ];

      // TODO: Uncomment and fix once userRoles table is properly defined
      /*
      let query = db.select().from(userRoles).where(eq(userRoles.userId, userId));
      
      // If organizationId is provided, filter by that as well
      if (organizationId) {
        query = query.where(
          or(
            eq(userRoles.organizationId, organizationId),
            eq(userRoles.organizationId, null as any) // Global roles with no org
          )
        );
      }
      
      const results = await query;
      return results.map(this.mapUserRoleToDTO);
      */
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
      throw new Error(
        `Failed to fetch user roles: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(params: UserRoleParams): Promise<UserRole> {
    try {
      console.log(
        "DEVELOPMENT MODE: Using mock user role assignment for testing",
      );

      // Check if the role exists
      const role = await this.getRoleById(params.roleId);
      if (!role) {
        throw new Error(`Role with ID ${params.roleId} not found`);
      }

      // In development mode, return mock data
      return {
        userId: params.userId,
        roleId: params.roleId,
        organizationId: params.organizationId,
        isDefault: params.isDefault || false,
      };

      // TODO: Uncomment and fix once userRoles table is properly defined
      /*
      // Check if the user already has this role for this organization
      const existingRoles = await db.select().from(userRoles).where(
        and(
          eq(userRoles.userId, params.userId),
          eq(userRoles.roleId, params.roleId),
          params.organizationId 
            ? eq(userRoles.organizationId, params.organizationId)
            : eq(userRoles.organizationId, null as any)
        )
      );
      
      if (existingRoles.length > 0) {
        throw new Error(`User already has this role assigned`);
      }
      
      // Insert the new role assignment
      const [result] = await db.insert(userRoles).values({
        userId: params.userId,
        roleId: params.roleId,
        organizationId: params.organizationId,
        isDefault: params.isDefault
      }).returning();
      
      return this.mapUserRoleToDTO(result);
      */
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw new Error(
        `Failed to assign role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    organizationId?: string,
  ): Promise<void> {
    try {
      console.log("DEVELOPMENT MODE: Using mock user role removal for testing");

      // In development mode, just log the removal intention
      console.log(
        `Mock removing role ${roleId} from user ${userId} ${organizationId ? "in organization " + organizationId : "globally"}`,
      );

      // TODO: Uncomment and fix once userRoles table is properly defined
      /*
      let query = db.delete(userRoles).where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      );
      
      // If organizationId is provided, filter by that as well
      if (organizationId) {
        query = query.where(eq(userRoles.organizationId, organizationId));
      } else {
        query = query.where(eq(userRoles.organizationId, null as any));
      }
      
      await query;
      */
    } catch (error) {
      console.error(
        `Error removing role ${roleId} from user ${userId}:`,
        error,
      );
      throw new Error(
        `Failed to remove role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get organization permissions
   */
  async getOrganizationPermissions(
    organizationId: string,
  ): Promise<OrganizationPermission[]> {
    try {
      const results = await db
        .select()
        .from(organizationPermissions)
        .where(eq(organizationPermissions.organizationId, organizationId));

      return results.map(this.mapOrganizationPermissionToDTO);
    } catch (error) {
      console.error(
        `Error fetching permissions for organization ${organizationId}:`,
        error,
      );
      throw new Error(
        `Failed to fetch organization permissions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Set organization permission
   */
  async setOrganizationPermission(
    params: OrganizationPermissionParams,
  ): Promise<OrganizationPermission> {
    try {
      // Check if the permission already exists for this organization
      const existingPermissions = await db
        .select()
        .from(organizationPermissions)
        .where(
          and(
            eq(organizationPermissions.organizationId, params.organizationId),
            eq(organizationPermissions.permission, params.permission),
          ),
        );

      if (existingPermissions.length > 0) {
        // Update the existing permission
        const [result] = await db
          .update(organizationPermissions)
          .set({
            isGranted: params.isGranted,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(organizationPermissions.organizationId, params.organizationId),
              eq(organizationPermissions.permission, params.permission),
            ),
          )
          .returning();

        return this.mapOrganizationPermissionToDTO(result);
      } else {
        // Insert a new permission
        const [result] = await db
          .insert(organizationPermissions)
          .values({
            organizationId: params.organizationId,
            permission: params.permission,
            isGranted: params.isGranted,
          })
          .returning();

        return this.mapOrganizationPermissionToDTO(result);
      }
    } catch (error) {
      console.error("Error setting organization permission:", error);
      throw new Error(
        `Failed to set organization permission: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Remove organization permission
   */
  async removeOrganizationPermission(
    organizationId: string,
    permission: string,
  ): Promise<void> {
    try {
      await db
        .delete(organizationPermissions)
        .where(
          and(
            eq(organizationPermissions.organizationId, organizationId),
            eq(organizationPermissions.permission, permission),
          ),
        );
    } catch (error) {
      console.error(
        `Error removing permission ${permission} from organization ${organizationId}:`,
        error,
      );
      throw new Error(
        `Failed to remove organization permission: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Map database role to DTO
   */
  private mapRoleToDTO(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
      isSystem: role.isSystem || false,
      isDefault: role.isDefault || false,
      createdAt: role.createdAt?.toISOString(),
      updatedAt: role.updatedAt?.toISOString(),
    };
  }

  /**
   * Map database user role to DTO
   */
  private mapUserRoleToDTO(userRole: any): UserRole {
    return {
      userId: userRole.userId,
      roleId: userRole.roleId,
      organizationId: userRole.organizationId || undefined,
      isDefault: userRole.isDefault || false,
    };
  }

  /**
   * Map database organization permission to DTO
   */
  private mapOrganizationPermissionToDTO(
    orgPermission: any,
  ): OrganizationPermission {
    return {
      organizationId: orgPermission.organizationId,
      permission: orgPermission.permission,
      isGranted: orgPermission.isGranted,
    };
  }
}
