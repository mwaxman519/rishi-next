"use server";

import { hashPassword } from "../../lib/auth-utils";
import { USER_ROLES, UserRole } from "../../../shared/rbac/roles";
import { eventBus } from "../../../shared/events";
import {
  mapDatabaseUserToCredentials,
  mapDatabaseUserToProfile,
} from "../../lib/user-repository-helpers";
import { userRepository } from "./repository";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserProfile,
  UserWithCredentials,
  ServiceResponse,
  UserResponse,
  UsersResponse,
} from "./models";

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UsersResponse> {
  try {
    // We'll implement a mock function since getAllUsers doesn't exist in the repository
    const users: UserProfile[] = []; // Temporary placeholder - in production this would call repository.getAllUsers()
    return { success: true, data: users };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const user = await userRepository.getUserById(id);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(user);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in getUserById(${id}):`, error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(
  username: string,
): Promise<UserResponse> {
  try {
    const user = await userRepository.getUserByUsername(username);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(user);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in getUserByUsername(${username}):`, error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(
  userData: CreateUserRequest,
): Promise<UserResponse> {
  try {
    console.log(
      "[userService] createUser - Starting with username:",
      userData.username,
    );

    // Check if username already exists
    console.log("[userService] Checking if username already exists");
    const existingUser = await userRepository.findByUsername(userData.username);

    if (existingUser) {
      console.log("[userService] Username already exists:", userData.username);
      return {
        success: false,
        error: "Username already exists",
      };
    }

    // Hash password
    console.log("[userService] Hashing password");
    try {
      const hashedPassword = await hashPassword(userData.password);
      console.log("[userService] Password hashed successfully");

      // Prepare user data for database
      const userDataForDb = {
        username: userData.username,
        password: hashedPassword,
        full_name: userData.fullName ?? undefined,
        email: userData.email ?? undefined,
        phone: userData.phone ?? undefined,
        role: userData.role || USER_ROLES.BRAND_AGENT,
        profile_image: userData.profileImage ?? undefined,
      };
      console.log("[userService] Prepared user data for database:", {
        ...userDataForDb,
        password: "[REDACTED]",
      });

      // Create user with hashed password
      console.log("[userService] Calling repository.create");
      const newUser = await userRepository.create(userDataForDb);

      if (!newUser) {
        return {
          success: false,
          error: "Failed to create user - database error",
        };
      }

      console.log("[userService] User created successfully:", {
        id: newUser.id,
        username: newUser.username,
      });

      // Emit user created event
      console.log("[userService] Emitting user.created event");
      eventBus.emit("user.created", {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      });

      // Convert DB model to domain model
      const userProfile = mapDatabaseUserToProfile(newUser);

      return { success: true, data: userProfile };
    } catch (hashError) {
      console.error("[userService] Error hashing password:", hashError);
      return {
        success: false,
        error: `Failed to hash password: ${hashError instanceof Error ? hashError.message : "Unknown error"}`,
      };
    }
  } catch (error) {
    console.error("[userService] Error in createUser:", error);
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? "\n" + error.stack : ""}`
        : "Unknown error";
    console.error("[userService] Detailed error:", errorMessage);

    return {
      success: false,
      error:
        error instanceof Error
          ? `Failed to create user: ${error.message}`
          : "Failed to create user",
    };
  }
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  userData: UpdateUserRequest,
): Promise<UserResponse> {
  try {
    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Create update data with proper null handling
    const updateData: any = {
      full_name: userData.fullName ?? undefined,
      email: userData.email ?? undefined,
      phone: userData.phone ?? undefined,
      profile_image: userData.profileImage ?? undefined,
    };

    // Only include active and role fields if they're provided
    if (userData.active !== undefined) {
      updateData.active = userData.active;
    }

    if (userData.role !== undefined) {
      updateData.role = userData.role;
    }

    // Update user
    const updatedUser = await userRepository.update(id, updateData);

    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to update user",
      };
    }

    // Emit user updated event
    eventBus.emit("user.updated", {
      id: updatedUser.id,
      changes: userData,
    });

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(updatedUser);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in updateUser(${id}):`, error);
    return {
      success: false,
      error: "Failed to update user",
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUser(
  id: string,
): Promise<ServiceResponse<boolean>> {
  try {
    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Delete user
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: "Failed to delete user",
      };
    }

    // Emit user deleted event
    eventBus.emit("user.deleted", { id });

    return { success: true, data: true };
  } catch (error) {
    console.error(`Error in deleteUser(${id}):`, error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<UsersResponse> {
  try {
    console.log(`[userService] Getting users with role: ${role}`);

    // Create a sample list of workers for development purposes
    // In production, this would call the repository methods to get actual users
    const workers = [
      {
        id: "1",
        username: "field_agent1",
        email: "field1@rishi.com",
        fullName: "Field Agent One",
        role: USER_ROLES.BRAND_AGENT,
        profileImage: null,
        phone: "555-123-4567",
        active: true,
      },
      {
        id: "2",
        username: "field_agent2",
        email: "field2@rishi.com",
        fullName: "Field Agent Two",
        role: USER_ROLES.BRAND_AGENT,
        profileImage: null,
        phone: "555-234-5678",
        active: true,
      },
      {
        id: "3",
        username: "field_manager1",
        email: "manager1@rishi.com",
        fullName: "Field Manager One",
        role: USER_ROLES.INTERNAL_FIELD_MANAGER,
        profileImage: null,
        phone: "555-345-6789",
        active: true,
      },
    ] as UserProfile[];

    // Filter the users based on the requested role
    const filteredUsers = workers.filter(
      (user: UserProfile) => user.role === role,
    );
    console.log(
      `[userService] Found ${filteredUsers.length} users with role ${role}`,
    );

    return { success: true, data: filteredUsers };
  } catch (error) {
    console.error(`Error in getUsersByRole(${role}):`, error);
    return {
      success: false,
      error: "Failed to fetch users by role",
    };
  }
}

/**
 * Get user by username with credentials (for authentication)
 * This method is for internal use by the AuthService
 */
export async function getUserWithCredentials(
  username: string,
): Promise<ServiceResponse<UserWithCredentials>> {
  try {
    const user = await userRepository.findByUsernameWithPassword(username);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Map to UserWithCredentials type using our helper
    const userWithCredentials = mapDatabaseUserToCredentials(user);

    return { success: true, data: userWithCredentials };
  } catch (error) {
    console.error(`Error in getUserWithCredentials(${username}):`, error);
    return {
      success: false,
      error: "Failed to fetch user credentials",
    };
  }
}

/**
 * Export async functions for use with 'use server' directive
 * Each function becomes a Server Action when exported individually
 */
