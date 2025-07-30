import { comparePasswords } from &quot;@/lib/auth-server&quot;;
import { createTokenCookie, clearTokenCookie } from &quot;@/lib/auth-server&quot;;
import { USER_ROLES, UserRole } from &quot;../../../shared/schema&quot;;
import { eventBus } from &quot;../../shared/events&quot;;
import { userService } from &quot;../users/userService&quot;;
import { UserWithCredentials } from &quot;../users/models&quot;;
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthUser,
  VerifyTokenResult,
} from &quot;./models&quot;;
import { NextResponse } from &quot;next/server&quot;;

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
          error: &quot;Passwords do not match&quot;,
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
      eventBus.emit(&quot;user.login&quot;, {
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
      console.error(&quot;Error in register:&quot;, error);
      return {
        success: false,
        error: &quot;Registration failed&quot;,
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
          error: &quot;Invalid username or password&quot;,
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
          error: &quot;Invalid username or password&quot;,
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
      eventBus.emit(&quot;user.login&quot;, {
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
      console.error(&quot;Error in login:&quot;, error);
      return {
        success: false,
        error: &quot;Login failed&quot;,
      };
    }
  }

  /**
   * Logout a user
   */
  async logout(userId: number): Promise<boolean> {
    try {
      // Emit logout event
      eventBus.emit(&quot;user.logout&quot;, { id: userId });
      return true;
    } catch (error) {
      console.error(&quot;Error in logout:&quot;, error);
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
          error: &quot;Invalid token&quot;,
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
      console.error(&quot;Error in verifyToken:&quot;, error);
      return {
        valid: false,
        error: &quot;Token verification failed&quot;,
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
        fullName: user.fullName,
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
      message: &quot;Logged out successfully&quot;,
    });

    // Clear auth cookie
    clearTokenCookie(response);

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();
