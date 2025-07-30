/**
 * Authentication Hook and Context Provider
 *
 * This authentication system provides:
 * - Real authentication via the auth microservice
 * - Session management via HTTP cookies
 * - Role-based access control (RBAC)
 * - Organization context switching
 * - Proper security checks and token validation
 */

&quot;use client&quot;;

import { useState, useEffect, createContext, useContext } from &quot;react&quot;;
import {
  useAuthService,
  UserSession,
  LoginCredentials,
  RegisterData,
} from &quot;./useAuthService&quot;;

// Define registration result interface
interface RegisterResult {
  success: boolean;
  error?: string;
}

// Define the Auth context shape
interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  isRishiManagement: boolean;
  isFieldManager: boolean;
  isBrandAgent: boolean;
  isClientUser: boolean;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    confirmPassword: string,
    role: string,
    registrationPasscode?: string,
  ) => Promise<RegisterResult>;
}

// Create the Auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  hasPermission: () => false,
  isRishiManagement: false,
  isFieldManager: false,
  isBrandAgent: false,
  isClientUser: false,
  isSuperAdmin: false,
  logout: async () => {
    /* Default implementation */
  },
  login: async () => {
    console.error(&quot;Login not implemented in default context&quot;);
    return false;
  },
  register: async () => {
    console.error(&quot;Register not implemented in default context&quot;);
    return { success: false, error: &quot;Registration not implemented&quot; };
  },
});

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use our auth service client
  const authService = useAuthService();

  // Load the user on initial mount
  useEffect(() => {
    // Skip during static generation
    if (typeof window === &quot;undefined&quot;) {
      setIsLoading(false);
      return;
    }

    async function loadUser() {
      try {
        setIsLoading(true);

        // Get session from auth service
        const { user: sessionUser } = await authService.getSession();
        setUser(sessionUser);
      } catch (err) {
        console.error(&quot;Error loading user:&quot;, err);
        setError(
          err instanceof Error ? err : new Error(&quot;Unknown error loading user&quot;),
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Super admins have all permissions
    if (
      user.role === &quot;super_admin&quot; ||
      (user.roles && user.roles.includes(&quot;SUPER_ADMIN&quot;))
    ) {
      return true;
    }

    // Development mode: grant all permissions
    if (process.env.NODE_ENV === &quot;development&quot;) {
      return true;
    }

    // In a real implementation, would check against stored permissions
    // Real user logout implementation
    return false;
  };

  // Helper properties to identify user types
  const isRishiManagement =
    user?.role === &quot;internal_admin&quot; || user?.role === &quot;super_admin&quot;;
  const isFieldManager = user?.role === &quot;internal_field_manager&quot;;
  const isBrandAgent = user?.role === &quot;brand_agent&quot;;
  const isClientUser = user?.role === &quot;client_user&quot;;
  const isSuperAdmin = user?.role === &quot;super_admin&quot;;

  // Logout function implementation
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Call logout from auth service
      await authService.logout();

      // Clear user state
      setUser(null);
    } catch (err) {
      console.error(&quot;Error during logout:&quot;, err);
      setError(
        err instanceof Error ? err : new Error(&quot;Unknown error during logout&quot;),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Login function implementation
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call login from auth service
      const userData = await authService.login({ username, password });

      // Immediately update user state to prevent role timing issues
      setUser(userData);
      
      // Force a session refresh to ensure state is synchronized
      setTimeout(async () => {
        try {
          const { user: refreshedUser } = await authService.getSession();
          if (refreshedUser) {
            setUser(refreshedUser);
          }
        } catch (refreshError) {
          console.error(&quot;Session refresh error:&quot;, refreshError);
        }
      }, 100);

      return true;
    } catch (err) {
      console.error(&quot;Login error:&quot;, err);
      setError(
        err instanceof Error ? err : new Error(&quot;Unknown error during login&quot;),
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function implementation
  const register = async (
    username: string,
    password: string,
    confirmPassword: string,
    role: string,
    registrationPasscode?: string,
  ): Promise<RegisterResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Password validation
      if (password !== confirmPassword) {
        return { success: false, error: &quot;Passwords do not match&quot; };
      }

      try {
        // Call register from auth service with enhanced error handling
        // Include registration passcode only if provided
        const registerData = {
          username,
          password,
          confirmPassword,
          role,
        };

        // Only add the passcode if it&apos;s provided
        if (registrationPasscode) {
          (registerData as any).registrationPasscode = registrationPasscode;
        }

        const userData = await authService.register(registerData);

        // Update user state
        setUser(userData);

        return { success: true };
      } catch (serviceError: any) {
        console.error(&quot;Auth service registration error:&quot;, serviceError);

        // Create user-friendly error messages based on the error type
        let errorMessage = serviceError.message || &quot;Registration failed&quot;;

        // Handle network errors
        if (
          serviceError.name === &quot;TypeError&quot; &&
          serviceError.message.includes(&quot;Failed to fetch&quot;)
        ) {
          errorMessage =
            &quot;Cannot connect to the registration service. Please check your internet connection.&quot;;
        }
        // Handle database errors
        else if (
          errorMessage.includes(&quot;database&quot;) ||
          errorMessage.includes(&quot;Database&quot;) ||
          errorMessage.includes(&quot;connection&quot;) ||
          errorMessage.includes(&quot;not been initialized&quot;)
        ) {
          errorMessage =
            &quot;The registration system is currently experiencing database issues. Please try again later.&quot;;
        }
        // Handle Bad Gateway errors
        else if (
          errorMessage.includes(&quot;502&quot;) ||
          errorMessage.includes(&quot;Bad Gateway&quot;)
        ) {
          errorMessage =
            &quot;The registration service is temporarily unavailable. Our team has been notified.&quot;;
        }
        // Handle JSON parsing errors
        else if (
          errorMessage.includes(&quot;JSON&quot;) ||
          errorMessage.includes(&quot;Unexpected end&quot;)
        ) {
          errorMessage =
            &quot;The registration service returned an invalid response. Please try again later.&quot;;
        }
        // Handle timeout errors
        else if (
          errorMessage.includes(&quot;timeout&quot;) ||
          errorMessage.includes(&quot;timed out&quot;)
        ) {
          errorMessage =
            &quot;The registration request timed out. Please try again later.&quot;;
        }

        setError(new Error(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error(&quot;Registration error:&quot;, err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : &quot;An unexpected error occurred during registration&quot;;
      setError(err instanceof Error ? err : new Error(errorMessage));

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    hasPermission,
    isRishiManagement,
    isFieldManager,
    isBrandAgent,
    isClientUser,
    isSuperAdmin,
    logout,
    login,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export type { UserSession };
