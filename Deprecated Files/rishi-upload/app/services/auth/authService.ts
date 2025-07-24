import { comparePasswords, signJwt, verifyJwt } from "../../lib/auth-client";
import { createTokenCookie, clearTokenCookie } from "../../lib/auth-server";
import { USER_ROLES, UserRole } from "../../../shared/schema";
import { eventBus } from "../../shared/events";
import { userService } from "../users/userService";
import { UserWithCredentials } from "../users/models";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthUser,
  VerifyTokenResult,
} from "./models";
import { NextResponse } from "next/server";

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          error: "Passwords do not match",
        };
      }

      // Create user via user service
      const createResult = await userService.createUser({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        role: data.role || USER_ROLES.USER,
      });

      if (!createResult.success) {
        return {
          success: false,
          error: createResult.error,
        };
      }

      const user = createResult.data!;

      // Create JWT token
      const token = await signJwt({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      });

      // Emit login event
      eventBus.emit("user.login", {
        id: user.id,
        username: user.username,
      });

      // Return auth response
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      };
    } catch (error) {
      console.error("Error in register:", error);
      return {
        success: false,
        error: "Registration failed",
      };
    }
  }

  /**
   * Login a user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Get user with password for comparison
      const userResult = await userService.getUserByUsername(data.username);

      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      const user = userResult.data as UserWithCredentials;

      // Check if password is correct
      const isPasswordValid = await comparePasswords(
        user.password!,
        data.password,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      // Create JWT token
      const token = await signJwt({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      });

      // Emit login event
      eventBus.emit("user.login", {
        id: user.id,
        username: user.username,
      });

      // Return auth response
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      };
    } catch (error) {
      console.error("Error in login:", error);
      return {
        success: false,
        error: "Login failed",
      };
    }
  }

  /**
   * Logout a user
   */
  async logout(userId: number): Promise<boolean> {
    try {
      // Emit logout event
      eventBus.emit("user.logout", { id: userId });
      return true;
    } catch (error) {
      console.error("Error in logout:", error);
      return false;
    }
  }

  /**
   * Verify a JWT token
   */
  async verifyToken(token: string): Promise<VerifyTokenResult> {
    try {
      const payload = await verifyJwt(token);

      if (!payload) {
        return {
          valid: false,
          error: "Invalid token",
        };
      }

      return {
        valid: true,
        user: {
          id: payload.id,
          username: payload.username,
          role: payload.role as UserRole,
          fullName: payload.fullName,
        },
      };
    } catch (error) {
      console.error("Error in verifyToken:", error);
      return {
        valid: false,
        error: "Token verification failed",
      };
    }
  }

  /**
   * Create authentication response with cookie
   */
  createAuthResponse(user: AuthUser, token: string): NextResponse {
    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.fullName,
      },
      token,
    });

    // Set auth cookie
    createTokenCookie(token, response);

    return response;
  }

  /**
   * Create logout response with cleared cookie
   */
  createLogoutResponse(): NextResponse {
    // Create response
    const response = NextResponse.json({
      message: "Logged out successfully",
    });

    // Clear auth cookie
    clearTokenCookie(response);

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();
