/**
 * Auth Service Client Adapter
 *
 * Client-side adapter for interacting with the authentication service.
 */

import { ApiError } from &quot;@/lib/errors&quot;;

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
      const response = await fetch(&quot;/api/auth/login&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Login failed&quot;,
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to login&quot;, 500);
    }
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Created user information
   */
  async register(userData: RegisterRequest): Promise<UserInfo> {
    try {
      const response = await fetch(&quot;/api/auth/register&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Registration failed&quot;,
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to register&quot;, 500);
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(&quot;/api/auth/logout&quot;, {
        method: &quot;POST&quot;,
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Logout failed&quot;,
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to logout&quot;, 500);
    }
  }

  /**
   * Get the current authenticated user
   * @returns User information or null if not authenticated
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await fetch(&quot;/api/auth/me&quot;, {
        credentials: &quot;include&quot;,
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Failed to get user&quot;,
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to get user information&quot;, 500);
    }
  }

  /**
   * Refresh the access token
   * @returns New auth tokens
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const response = await fetch(&quot;/api/auth/refresh&quot;, {
        method: &quot;POST&quot;,
        credentials: &quot;include&quot;,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Token refresh failed&quot;,
          response.status,
          error.details,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to refresh token&quot;, 500);
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
      const response = await fetch(&quot;/api/auth/change-password&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        credentials: &quot;include&quot;,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Password change failed&quot;,
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to change password&quot;, 500);
    }
  }

  /**
   * Request a password reset email
   * @param email User's email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(&quot;/api/auth/request-reset&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Password reset request failed&quot;,
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to request password reset&quot;, 500);
    }
  }

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(&quot;/api/auth/reset-password&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || &quot;Password reset failed&quot;,
          response.status,
          error.details,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(&quot;Failed to reset password&quot;, 500);
    }
  }
}

// Create singleton instance
export const authService = new AuthServiceClient();
