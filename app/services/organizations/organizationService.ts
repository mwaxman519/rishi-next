/**
 * Organization Service - Core business logic for organization management
 */
import { OrganizationRepository } from &quot;./repository&quot;;
import {
  Organization,
  OrganizationUser,
  UserOrganization,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  OrganizationUserParams,
  OrganizationFilters,
  OrganizationType,
} from &quot;./models&quot;;
import { rbacService } from &quot;../rbac&quot;;

export class OrganizationService {
  private repository: OrganizationRepository;

  constructor() {
    this.repository = new OrganizationRepository();
  }

  /**
   * Get all organizations
   */
  async getAllOrganizations(): Promise<Organization[]> {
    return this.repository.getAllOrganizations();
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.repository.getOrganizationById(id);
  }

  /**
   * Create a new organization
   */
  async createOrganization(
    data: CreateOrganizationParams,
  ): Promise<Organization> {
    // Validate client tier for client organizations
    if (data.type === OrganizationType.CLIENT && !data.tier) {
      throw new Error(&quot;Client tier is required for client organizations&quot;);
    }

    // Internal org validation
    if (data.type === OrganizationType.INTERNAL) {
      // Additional validations for internal org if needed
    }

    return this.repository.createOrganization(data);
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(
    id: string,
    data: UpdateOrganizationParams,
  ): Promise<Organization> {
    // Get the current organization state
    const existingOrg = await this.repository.getOrganizationById(id);

    if (!existingOrg) {
      throw new Error(`Organization with ID ${id} not found`);
    }

    // If changing the organization type to CLIENT, ensure tier is set
    if (
      data.type === OrganizationType.CLIENT &&
      !data.tier &&
      !existingOrg.tier
    ) {
      throw new Error(&quot;Client tier is required for client organizations&quot;);
    }

    return this.repository.updateOrganization(id, data);
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: string): Promise<void> {
    return this.repository.deleteOrganization(id);
  }

  /**
   * Search organizations with filters
   */
  async searchOrganizations(
    filters: OrganizationFilters,
  ): Promise<Organization[]> {
    return this.repository.searchOrganizations(filters);
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(
    params: OrganizationUserParams,
  ): Promise<OrganizationUser> {
    const organization = await this.repository.getOrganizationById(
      params.organizationId,
    );

    if (!organization) {
      throw new Error(
        `Organization with ID ${params.organizationId} not found`,
      );
    }

    // Verify role exists via RBAC service
    const role = await rbacService.getRoleById(params.roleId);

    if (!role) {
      throw new Error(`Role with ID ${params.roleId} not found`);
    }

    // Add the user to the organization
    const orgUser = await this.repository.addUserToOrganization(params);

    // If marked as default, ensure it&apos;s set as the default org
    if (params.isDefault) {
      await this.repository.setDefaultOrganization(
        params.userId,
        params.organizationId,
      );
    }

    return orgUser;
  }

  /**
   * Update user's role in an organization
   */
  async updateUserRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<OrganizationUser> {
    // Verify role exists via RBAC service
    const role = await rbacService.getRoleById(roleId);

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    return this.repository.updateUserRole(organizationId, userId, roleId);
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    return this.repository.removeUserFromOrganization(organizationId, userId);
  }

  /**
   * Get all organizations for a user
   */
  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    return this.repository.getUserOrganizations(userId);
  }

  /**
   * Get all users in an organization
   */
  async getOrganizationUsers(
    organizationId: string,
  ): Promise<OrganizationUser[]> {
    return this.repository.getOrganizationUsers(organizationId);
  }

  /**
   * Set default organization for a user
   */
  async setDefaultOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    // Check if the user is a member of this organization
    const userOrgs = await this.repository.getUserOrganizations(userId);
    const isMember = userOrgs.some((org) => org.id === organizationId);

    if (!isMember) {
      throw new Error(
        `User is not a member of organization with ID ${organizationId}`,
      );
    }

    return this.repository.setDefaultOrganization(userId, organizationId);
  }

  /**
   * Get user's default organization
   */
  async getUserDefaultOrganization(
    userId: string,
  ): Promise<UserOrganization | null> {
    const userOrgs = await this.repository.getUserOrganizations(userId);

    // First try to find an explicitly marked default organization
    let defaultOrg = userOrgs.find((org) => org.isDefault);

    // If no default is explicitly set, use the first one
    if (!defaultOrg && userOrgs.length > 0) {
      defaultOrg = userOrgs[0];

      // Set this as the default for future reference
      await this.repository.setDefaultOrganization(userId, defaultOrg.id);
    }

    return defaultOrg || null;
  }

  /**
   * Switch user's context to a different organization
   */
  async switchUserOrganization(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization> {
    // Get all the user's organizations
    const userOrgs = await this.repository.getUserOrganizations(userId);

    // Find the requested organization
    const targetOrg = userOrgs.find((org) => org.id === organizationId);

    if (!targetOrg) {
      throw new Error(
        `User is not a member of organization with ID ${organizationId}`,
      );
    }

    // Set this as the default organization
    await this.repository.setDefaultOrganization(userId, organizationId);

    return targetOrg;
  }
}
