&quot;use server&quot;;

import { hashPassword } from &quot;../../lib/auth-server&quot;;
import { USER_ROLES, UserRole } from &quot;../../../shared/rbac/roles&quot;;
import { eventBus } from &quot;../../../shared/events&quot;;
import {
  mapDatabaseUserToCredentials,
  mapDatabaseUserToProfile,
} from &quot;../../lib/user-repository-helpers&quot;;
import { userRepository } from &quot;./repository&quot;;
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserProfile,
  UserWithCredentials,
  ServiceResponse,
  UserResponse,
  UsersResponse,
} from &quot;./models&quot;;

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UsersResponse> {
  try {
    console.log(&quot;[userService] Getting all users&quot;);
    const users = await userRepository.getAllUsers();
    console.log(`[userService] Found ${users?.length || 0} users`);
    
    if (!users) {
      return { success: true, data: [] };
    }

    // Convert DB models to domain models
    const userProfiles = users.map(mapDatabaseUserToProfile);
    
    return { success: true, data: userProfiles };
  } catch (error) {
    console.error(&quot;Error in getAllUsers:&quot;, error);
    return {
      success: false,
      error: &quot;Failed to fetch users&quot;,
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
        error: &quot;User not found&quot;,
      };
    }

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(user);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in getUserById(${id}):`, error);
    return {
      success: false,
      error: &quot;Failed to fetch user&quot;,
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
        error: &quot;User not found&quot;,
      };
    }

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(user);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in getUserByUsername(${username}):`, error);
    return {
      success: false,
      error: &quot;Failed to fetch user&quot;,
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
      &quot;[userService] createUser - Starting with username:&quot;,
      userData.username,
    );

    // Check if username already exists
    console.log(&quot;[userService] Checking if username already exists&quot;);
    const existingUser = await userRepository.findByUsername(userData.username);

    if (existingUser) {
      console.log(&quot;[userService] Username already exists:&quot;, userData.username);
      return {
        success: false,
        error: &quot;Username already exists&quot;,
      };
    }

    // Check if email already exists (if provided)
    if (userData.email) {
      console.log(&quot;[userService] Checking if email already exists&quot;);
      const existingEmailUser = await userRepository.findByEmail(userData.email);

      if (existingEmailUser) {
        console.log(&quot;[userService] Email already exists:&quot;, userData.email);
        return {
          success: false,
          error: &quot;Email already exists&quot;,
        };
      }
    }

    // Hash password
    console.log(&quot;[userService] Hashing password&quot;);
    try {
      const hashedPassword = await hashPassword(userData.password);
      console.log(&quot;[userService] Password hashed successfully&quot;);

      // Prepare user data for database
      const userDataForDb = {
        username: userData.username,
        password: hashedPassword,
        fullName: userData.fullName ?? undefined,
        email: userData.email ?? undefined,
        phone: userData.phone ?? undefined,
        role: userData.role || USER_ROLES.BRAND_AGENT,
        profileImage: userData.profileImage ?? undefined,
      };
      console.log(&quot;[userService] Prepared user data for database:&quot;, {
        ...userDataForDb,
        password: &quot;[REDACTED]&quot;,
      });

      // Create user with hashed password
      console.log(&quot;[userService] Calling repository.create&quot;);
      const newUser = await userRepository.create(userDataForDb);

      if (!newUser) {
        return {
          success: false,
          error: &quot;Failed to create user - database error&quot;,
        };
      }

      console.log(&quot;[userService] User created successfully:&quot;, {
        id: newUser.id,
        username: newUser.username,
      });

      // Emit user created event
      console.log(&quot;[userService] Emitting user.created event&quot;);
      try {
        eventBus.emit(&quot;user.created&quot;, {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        });
      } catch (eventError) {
        console.warn(&quot;Failed to emit user.created event:&quot;, eventError);
        // Continue with the operation even if event emission fails
      }

      // Convert DB model to domain model
      const userProfile = mapDatabaseUserToProfile(newUser);

      return { success: true, data: userProfile };
    } catch (hashError) {
      console.error(&quot;[userService] Error hashing password:&quot;, hashError);
      return {
        success: false,
        error: `Failed to hash password: ${hashError instanceof Error ? hashError.message : &quot;Unknown error&quot;}`,
      };
    }
  } catch (error) {
    console.error(&quot;[userService] Error in createUser:&quot;, error);
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? &quot;\n&quot; + error.stack : "&quot;}`
        : &quot;Unknown error&quot;;
    console.error(&quot;[userService] Detailed error:&quot;, errorMessage);

    return {
      success: false,
      error:
        error instanceof Error
          ? `Failed to create user: ${error.message}`
          : &quot;Failed to create user&quot;,
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
        error: &quot;User not found&quot;,
      };
    }

    // Create update data with proper null handling
    const updateData: any = {
      fullName: userData.fullName ?? undefined,
      email: userData.email ?? undefined,
      phone: userData.phone ?? undefined,
      profileImage: userData.profileImage ?? undefined,
    };

    // Only include active and role fields if they&apos;re provided
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
        error: &quot;Failed to update user&quot;,
      };
    }

    // Emit user updated event
    try {
      eventBus.emit(&quot;user.updated&quot;, {
        id: updatedUser.id,
        changes: userData,
      });
    } catch (eventError) {
      console.warn(&quot;Failed to emit user.updated event:&quot;, eventError);
      // Continue with the operation even if event emission fails
    }

    // Convert DB model to domain model
    const userProfile = mapDatabaseUserToProfile(updatedUser);

    return { success: true, data: userProfile };
  } catch (error) {
    console.error(`Error in updateUser(${id}):`, error);
    return {
      success: false,
      error: &quot;Failed to update user&quot;,
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
        error: &quot;User not found&quot;,
      };
    }

    // Delete user
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: &quot;Failed to delete user&quot;,
      };
    }

    // Emit user deleted event
    try {
      eventBus.emit(&quot;user.deleted&quot;, { id });
    } catch (eventError) {
      console.warn(&quot;Failed to emit user.deleted event:&quot;, eventError);
      // Continue with the operation even if event emission fails
    }

    return { success: true, data: true };
  } catch (error) {
    console.error(`Error in deleteUser(${id}):`, error);
    return {
      success: false,
      error: &quot;Failed to delete user&quot;,
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
        id: &quot;1&quot;,
        username: &quot;field_agent1&quot;,
        email: &quot;field1@rishi.com&quot;,
        fullName: &quot;Field Agent One&quot;,
        role: USER_ROLES.BRAND_AGENT,
        profileImage: null,
        phone: &quot;555-123-4567&quot;,
        active: true,
      },
      {
        id: &quot;2&quot;,
        username: &quot;field_agent2&quot;,
        email: &quot;field2@rishi.com&quot;,
        fullName: &quot;Field Agent Two&quot;,
        role: USER_ROLES.BRAND_AGENT,
        profileImage: null,
        phone: &quot;555-234-5678&quot;,
        active: true,
      },
      {
        id: &quot;3&quot;,
        username: &quot;field_manager1&quot;,
        email: &quot;manager1@rishi.com&quot;,
        fullName: &quot;Field Manager One&quot;,
        role: USER_ROLES.INTERNAL_FIELD_MANAGER,
        profileImage: null,
        phone: &quot;555-345-6789&quot;,
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
      error: &quot;Failed to fetch users by role&quot;,
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
        error: &quot;User not found&quot;,
      };
    }

    // Map to UserWithCredentials type using our helper
    const userWithCredentials = mapDatabaseUserToCredentials(user);

    return { success: true, data: userWithCredentials };
  } catch (error) {
    console.error(`Error in getUserWithCredentials(${username}):`, error);
    return {
      success: false,
      error: &quot;Failed to fetch user credentials",
    };
  }
}

/**
 * Export async functions for use with 'use server' directive
 * Each function becomes a Server Action when exported individually
 */
