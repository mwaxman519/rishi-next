/**
 * Auth Service Client Adapter
 *
 * Client-side adapter for interacting with the authentication service.
 */

import { ApiError } from "@/lib/errors";

/**
 * Interface for a login request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Interface for a registration request
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Interface for user information
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for the auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Auth service client adapter
 */
export class AuthServiceClient {
  /**
   * Attempt to login a user
   * @param credentials User credentials
   * @returns User information and tokens
   */
  async login(
    credentials: LoginRequest,
  ): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Login failed",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to login", 500);
    }
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Created user information
   */
  async register(userData: RegisterRequest): Promise<UserInfo> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Registration failed",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to register", 500);
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch("/api/auth-service/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Logout failed",
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to logout", 500);
    }
  }

  /**
   * Get the current authenticated user
   * @returns User information or null if not authenticated
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Failed to get user",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to get user information", 500);
    }
  }

  /**
   * Refresh the access token
   * @returns New auth tokens
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Token refresh failed",
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to refresh token", 500);
    }
  }

  /**
   * Change the user's password
   * @param currentPassword The current password
   * @param newPassword The new password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Password change failed",
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to change password", 500);
    }
  }

  /**
   * Request a password reset email
   * @param email User's email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Password reset request failed",
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to request password reset", 500);
    }
  }

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || "Password reset failed",
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to reset password", 500);
    }
  }
}

// Create singleton instance
export const authService = new AuthServiceClient();
