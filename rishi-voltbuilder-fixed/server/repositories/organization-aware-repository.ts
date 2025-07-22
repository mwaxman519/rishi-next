/**
 * Organization-Aware Repository Pattern
 *
 * This module provides a repository pattern implementation that is aware of the organization context.
 * It ensures that all data access is properly scoped to the correct organization.
 */

import { IStorage, OrganizationContext } from "../storage";
import {
  Organization,
  User,
  Role,
  Permission,
  OrganizationPermission,
  InsertUser,
  InsertOrganizationPermission,
} from "@shared/schema";

/**
 * The base organization-aware repository that provides common functionality
 */
export class OrganizationAwareRepository {
  protected storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Get the organization by ID
   */
  async getOrganization(
    organizationId: number,
  ): Promise<Organization | undefined> {
    return this.storage.getOrganization(organizationId);
  }
}

/**
 * Organization-aware user repository for managing users within an organization context
 */
export class UserRepository extends OrganizationAwareRepository {
  /**
   * Get all users in the specified organization
   */
  async getUsers(context: OrganizationContext): Promise<User[]> {
    return this.storage.getUsersByOrganization(context.organizationId);
  }

  /**
   * Get a specific user within the organization context
   */
  async getUser(
    userId: number,
    context: OrganizationContext,
  ): Promise<User | undefined> {
    const user = await this.storage.getUser(userId);

    // Ensure the user belongs to the current organization
    if (user && user.organizationId === context.organizationId) {
      return user;
    }

    return undefined;
  }

  /**
   * Create a new user in the organization
   */
  async createUser(
    userData: InsertUser,
    context: OrganizationContext,
  ): Promise<User> {
    // Ensure the user is created in the correct organization
    const userWithOrg = {
      ...userData,
      organizationId: context.organizationId,
    };

    return this.storage.createUser(userWithOrg);
  }

  /**
   * Update an existing user within the organization context
   */
  async updateUser(
    userId: number,
    userData: Partial<InsertUser>,
    context: OrganizationContext,
  ): Promise<User | undefined> {
    // First verify the user belongs to this organization
    const existingUser = await this.getUser(userId, context);

    if (!existingUser) {
      return undefined;
    }

    // Remove any attempt to change the organization ID
    const safeUserData = { ...userData };
    delete (safeUserData as any).organizationId;

    return this.storage.updateUser(userId, safeUserData);
  }
}

/**
 * Organization-aware permissions repository for managing roles and permissions within an organization
 */
export class PermissionRepository extends OrganizationAwareRepository {
  /**
   * Get all roles available for the organization
   */
  async getRoles(context: OrganizationContext): Promise<Role[]> {
    // TODO: This would need to be enhanced to filter roles by organization type/tier
    return this.storage.getAllRoles();
  }

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return this.storage.getRolePermissions(roleId);
  }

  /**
   * Get all organization-specific permissions
   */
  async getOrganizationPermissions(
    context: OrganizationContext,
  ): Promise<OrganizationPermission[]> {
    return this.storage.getOrganizationPermissions(context.organizationId);
  }

  /**
   * Add a new organization-specific permission
   */
  async addOrganizationPermission(
    permissionData: InsertOrganizationPermission,
    context: OrganizationContext,
  ): Promise<OrganizationPermission> {
    // Ensure the permission is created for the correct organization
    const permissionWithOrg = {
      ...permissionData,
      organizationId: context.organizationId,
    };

    return this.storage.addOrganizationPermission(permissionWithOrg);
  }

  /**
   * Update an existing organization-specific permission
   */
  async updateOrganizationPermission(
    id: number,
    permissionData: Partial<InsertOrganizationPermission>,
    context: OrganizationContext,
  ): Promise<OrganizationPermission | undefined> {
    // First verify the permission belongs to this organization
    const existingPermission = await this.storage.getOrganizationPermission(id);

    if (
      !existingPermission ||
      existingPermission.organizationId !== context.organizationId
    ) {
      return undefined;
    }

    // Remove any attempt to change the organization ID
    const safePermissionData = { ...permissionData };
    delete (safePermissionData as any).organizationId;

    return this.storage.updateOrganizationPermission(id, safePermissionData);
  }

  /**
   * Remove an organization-specific permission
   */
  async removeOrganizationPermission(id: number): Promise<boolean> {
    return this.storage.removeOrganizationPermission(id);
  }
}

/**
 * Factory to create organization-aware repositories
 */
export class RepositoryFactory {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  createUserRepository(): UserRepository {
    return new UserRepository(this.storage);
  }

  createPermissionRepository(): PermissionRepository {
    return new PermissionRepository(this.storage);
  }
}
