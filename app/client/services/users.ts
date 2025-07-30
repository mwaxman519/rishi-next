/**
 * Users Service Client Adapter
 *
 * Client-side adapter for interacting with the users service.
 */

import { ApiError } from "@/lib/errors";

/**
 * User model interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles: string[];
  permissions?: string[];
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationIds?: string[];
}

/**
 * User creation/update DTO
 */
export interface UserDTO {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  roleIds?: string[];
  organizationIds?: string[];
}

/**
 * User query parameters
 */
export interface UserQueryParams {
  search?: string;
  organizationId?: string;
  roleId?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Users service client adapter
 */
export class UsersServiceClient {
  /**
   * Get all users
   * @param params Query parameters for filtering
   * @returns Array of users and pagination info
   */
  async getUsers(
    params: UserQueryParams = {},
  ): Promise<{ users: User[]; total: number }> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();

      if (params.search) queryParams.append("search", params.search);
      if (params.organizationId)
        queryParams.append("organizationId", params.organizationId);
      if (params.roleId) queryParams.append("roleId", params.roleId);
      if (params.isAdmin !== undefined)
        queryParams.append("isAdmin", params.isAdmin.toString());
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.offset) queryParams.append("offset", params.offset.toString());

      const queryString = queryParams.toString();
      const url = `/api/users${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to fetch users",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to fetch users", 500);
    }
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User data
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to fetch user with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to fetch user with ID ${id}`, 500);
    }
  }

  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  async createUser(userData: UserDTO): Promise<User> {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to create user",
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to create user", 500);
    }
  }

  /**
   * Update a user
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user
   */
  async updateUser(id: string, userData: Partial<UserDTO>): Promise<User> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to update user with ID ${id}`,
          response.status,
          error.details,
        );
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to update user with ID ${id}`, 500);
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Success status
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || `Failed to delete user with ID ${id}`,
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Failed to delete user with ID ${id}`, 500);
    }
  }

  /**
   * Change user's active status
   * @param id User ID
   * @param isActive New active status
   * @returns Updated user
   */
  async setUserActiveStatus(id: string, isActive: boolean): Promise<User> {
    return this.updateUser(id, { isActive });
  }

  /**
   * Add a user to an organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Success status
   */
  async addUserToOrganization(
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/users/${userId}/organizations/${organizationId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to add user to organization",
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to add user to organization", 500);
    }
  }

  /**
   * Remove a user from an organization
   * @param userId User ID
   * @param organizationId Organization ID
   * @returns Success status
   */
  async removeUserFromOrganization(
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/users/${userId}/organizations/${organizationId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to remove user from organization",
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to remove user from organization", 500);
    }
  }

  /**
   * Assign a role to a user
   * @param userId User ID
   * @param roleId Role ID
   * @returns Success status
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}/roles/${roleId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to assign role to user",
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to assign role to user", 500);
    }
  }

  /**
   * Remove a role from a user
   * @param userId User ID
   * @param roleId Role ID
   * @returns Success status
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}/roles/${roleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to remove role from user",
          response.status,
          error.details,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to remove role from user", 500);
    }
  }
}

// Create singleton instance
export const usersService = new UsersServiceClient();
