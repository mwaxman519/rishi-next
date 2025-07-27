/**
 * Organization Repository for data access operations
 */
import { db } from "../../server/db";
import { organizations, organizationUsers } from "../../../shared/schema";
import { eq, and, like, inArray } from "drizzle-orm";
import {
  Organization,
  OrganizationUser,
  UserOrganization,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  OrganizationUserParams,
  OrganizationFilters,
  OrganizationType,
  ClientTier,
} from "./models";

export class OrganizationRepository {
  /**
   * Get all organizations
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const result = await db.select().from(organizations);
      return result.map(this.mapOrganizationToDTO);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw new Error(
        `Failed to fetch organizations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const [result] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id));

      if (!result) {
        return null;
      }

      return this.mapOrganizationToDTO(result);
    } catch (error) {
      console.error(`Error fetching organization with ID ${id}:`, error);
      throw new Error(
        `Failed to fetch organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(
    data: CreateOrganizationParams,
  ): Promise<Organization> {
    try {
      const [result] = await db
        .insert(organizations)
        .values({
          name: data.name,
          type: data.type,
          tier: data.tier,
          description: data.description,
          logo: data.logo,
          website: data.website,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isActive: data.isActive,
          parentOrganizationId: data.parentOrganizationId,
        })
        .returning();

      return this.mapOrganizationToDTO(result);
    } catch (error) {
      console.error("Error creating organization:", error);
      throw new Error(
        `Failed to create organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationParams,
  ): Promise<Organization> {
    try {
      const [result] = await db
        .update(organizations)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, id))
        .returning();

      if (!result) {
        throw new Error(`Organization with ID ${id} not found`);
      }

      return this.mapOrganizationToDTO(result);
    } catch (error) {
      console.error(`Error updating organization with ID ${id}:`, error);
      throw new Error(
        `Failed to update organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: string): Promise<void> {
    try {
      // Check if the organization exists first
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id));

      if (!organization) {
        throw new Error(`Organization with ID ${id} not found`);
      }

      // Check if this is an internal organization
      if (organization.type === OrganizationType.INTERNAL) {
        throw new Error("Cannot delete internal organizations");
      }

      // Delete the organization
      await db.delete(organizations).where(eq(organizations.id, id));
    } catch (error) {
      console.error(`Error deleting organization with ID ${id}:`, error);
      throw new Error(
        `Failed to delete organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Search organizations with filters
   */
  async searchOrganizations(
    filters: OrganizationFilters,
  ): Promise<Organization[]> {
    try {
      let query = db.select().from(organizations);

      // Apply filters
      if (filters.name) {
        query = query.where(like(organizations.name, `%${filters.name}%`));
      }

      if (filters.type) {
        query = query.where(eq(organizations.type, filters.type));
      }

      if (filters.tier) {
        query = query.where(eq(organizations.tier, filters.tier));
      }

      if (filters.isActive !== undefined) {
        query = query.where(eq(organizations.isActive, filters.isActive));
      }

      if (filters.parentOrganizationId) {
        query = query.where(
          eq(organizations.parentOrganizationId, filters.parentOrganizationId),
        );
      }

      const results = await query;
      return results.map(this.mapOrganizationToDTO);
    } catch (error) {
      console.error("Error searching organizations:", error);
      throw new Error(
        `Failed to search organizations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(
    params: OrganizationUserParams,
  ): Promise<OrganizationUser> {
    try {
      // Check if the organization exists
      const organization = await this.getOrganizationById(
        params.organizationId,
      );
      if (!organization) {
        throw new Error(
          `Organization with ID ${params.organizationId} not found`,
        );
      }

      // Check if the user is already in this organization
      const existingUsers = await db
        .select()
        .from(organizationUsers)
        .where(
          and(
            eq(organizationUsers.organizationId, params.organizationId),
            eq(organizationUsers.userId, params.userId),
          ),
        );

      if (existingUsers.length > 0) {
        throw new Error(`User is already a member of this organization`);
      }

      // Insert the new organization user
      const [result] = await db
        .insert(organizationUsers)
        .values({
          organizationId: params.organizationId,
          userId: params.userId,
          roleId: params.roleId,
          isDefault: params.isDefault,
        })
        .returning();

      return this.mapOrganizationUserToDTO(result);
    } catch (error) {
      console.error("Error adding user to organization:", error);
      throw new Error(
        `Failed to add user to organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update user's role in an organization
   */
  async updateUserRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<OrganizationUser> {
    try {
      // Check if the user is in this organization
      const [existingUser] = await db
        .select()
        .from(organizationUsers)
        .where(
          and(
            eq(organizationUsers.organizationId, organizationId),
            eq(organizationUsers.userId, userId),
          ),
        );

      if (!existingUser) {
        throw new Error(`User is not a member of this organization`);
      }

      // Update the user's role
      const [result] = await db
        .update(organizationUsers)
        .set({
          roleId: roleId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(organizationUsers.organizationId, organizationId),
            eq(organizationUsers.userId, userId),
          ),
        )
        .returning();

      return this.mapOrganizationUserToDTO(result);
    } catch (error) {
      console.error(
        `Error updating user role in organization ${organizationId}:`,
        error,
      );
      throw new Error(
        `Failed to update user role: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    try {
      await db
        .delete(organizationUsers)
        .where(
          and(
            eq(organizationUsers.organizationId, organizationId),
            eq(organizationUsers.userId, userId),
          ),
        );
    } catch (error) {
      console.error(
        `Error removing user from organization ${organizationId}:`,
        error,
      );
      throw new Error(
        `Failed to remove user from organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get all organizations for a user
   */
  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    try {
      // Join organization_users with organizations to get full organization data
      const results = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          tier: organizations.tier,
          roleId: organizationUsers.roleId,
          isDefault: organizationUsers.isDefault,
        })
        .from(organizationUsers)
        .innerJoin(
          organizations,
          eq(organizationUsers.organizationId, organizations.id),
        )
        .where(eq(organizationUsers.userId, userId));

      return results.map((result) => ({
        id: result.id,
        name: result.name,
        type: result.type as OrganizationType,
        tier: result.tier as ClientTier | undefined,
        roleId: result.roleId,
        isDefault: result.isDefault,
      }));
    } catch (error) {
      console.error(`Error fetching organizations for user ${userId}:`, error);
      throw new Error(
        `Failed to fetch user organizations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get all users in an organization
   */
  async getOrganizationUsers(
    organizationId: string,
  ): Promise<OrganizationUser[]> {
    try {
      const results = await db
        .select()
        .from(organizationUsers)
        .where(eq(organizationUsers.organizationId, organizationId));

      return results.map(this.mapOrganizationUserToDTO);
    } catch (error) {
      console.error(
        `Error fetching users for organization ${organizationId}:`,
        error,
      );
      throw new Error(
        `Failed to fetch organization users: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Set default organization for a user
   */
  async setDefaultOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    try {
      // First, reset all organizations to not default
      await db
        .update(organizationUsers)
        .set({ isDefault: false })
        .where(eq(organizationUsers.userId, userId));

      // Then set the specified organization as default
      await db
        .update(organizationUsers)
        .set({ isDefault: true })
        .where(
          and(
            eq(organizationUsers.userId, userId),
            eq(organizationUsers.organizationId, organizationId),
          ),
        );
    } catch (error) {
      console.error(
        `Error setting default organization for user ${userId}:`,
        error,
      );
      throw new Error(
        `Failed to set default organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Map database organization to DTO
   */
  private mapOrganizationToDTO(org: any): Organization {
    return {
      id: org.id,
      name: org.name,
      type: org.type,
      tier: org.tier || undefined,
      description: org.description || undefined,
      logo: org.logo || undefined,
      website: org.website || undefined,
      contactEmail: org.contactEmail || undefined,
      contactPhone: org.contactPhone || undefined,
      address: org.address || undefined,
      city: org.city || undefined,
      state: org.state || undefined,
      postalCode: org.postalCode || undefined,
      country: org.country || undefined,
      isActive: org.isActive || false,
      parentOrganizationId: org.parentOrganizationId || undefined,
      createdAt: org.createdAt?.toISOString(),
      updatedAt: org.updatedAt?.toISOString(),
    };
  }

  /**
   * Map database organization user to DTO
   */
  private mapOrganizationUserToDTO(orgUser: any): OrganizationUser {
    return {
      organizationId: orgUser.organizationId,
      userId: orgUser.userId,
      roleId: orgUser.roleId,
      isDefault: orgUser.isDefault || false,
      createdAt: orgUser.createdAt?.toISOString(),
      updatedAt: orgUser.updatedAt?.toISOString(),
    };
  }
}
