&quot;use server&quot;;

import {
  getAllUsers as getUsersService,
  getUserById as getUserByIdService,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  getUsersByRole as getUsersByRoleService,
} from &quot;../services/users/userService&quot;;

import {
  UserProfile,
  UsersResponse,
  UserResponse,
  UpdateUserRequest,
  CreateUserRequest,
} from &quot;../services/users/models&quot;;

import { hasPermission } from &quot;../lib/rbac&quot;;
import { getCurrentUser } from &quot;../lib/auth&quot;;

// Server action for fetching all users with permission check
export async function getAllUsers(): Promise<UsersResponse> {
  try {
    // For production, directly call the service since authentication is handled by the API
    // The frontend components should handle authentication state and permissions
    return await getUsersService();
  } catch (error) {
    console.error(&quot;Error in getAllUsers server action:&quot;, error);
    return {
      success: false,
      error: &quot;An error occurred while fetching users&quot;,
    };
  }
}

// Server action for fetching a user by ID
export async function getUserById(id: string): Promise<UserResponse> {
  return await getUserByIdService(id);
}

// Server action for creating a user
export async function createUser(
  userData: CreateUserRequest,
): Promise<UserResponse> {
  return await createUserService(userData);
}

// Server action for updating a user
export async function updateUser(
  id: string,
  userData: UpdateUserRequest,
): Promise<UserResponse> {
  return await updateUserService(id, userData);
}

// Server action for deleting a user
export async function deleteUser(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await deleteUserService(id);

  // Only include error field if it exists
  if (result.error) {
    return {
      success: result.success,
      error: result.error,
    };
  }

  return {
    success: result.success,
  };
}

// Server action for fetching users by role
export async function getUsersByRole(role: string): Promise<UsersResponse> {
  // Cast the role to UserRole type as expected by the service
  return await getUsersByRoleService(role as any);
}
