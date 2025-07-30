/**
 * Authentication Hook and Context Provider
 *
 * IMPORTANT PRODUCTION VS. DEVELOPMENT BEHAVIOR:
 *
 * This authentication system behaves differently based on the environment:
 *
 * IN DEVELOPMENT MODE:
 * - By default, a mock user with super_admin privileges is automatically logged in
 * - This makes development easier by not requiring login for most operations
 * - Adding ?unauthenticated=true to any URL will simulate a logged-out state
 * - The login function accepts any credentials and returns a successful login
 * - This allows for testing the login flow without a backend
 *
 * IN PRODUCTION MODE:
 * - No automatic login occurs - users must log in with valid credentials
 * - The system calls real API endpoints via the auth microservice
 * - Sessions are persisted via HTTP cookies set by the backend
 * - Proper security checks are enforced
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
    // This is a placeholder
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

      // Update user state
      setUser(userData);
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
  ): Promise<RegisterResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Password validation
      if (password !== confirmPassword) {
        return { success: false, error: &quot;Passwords do not match&quot; };
      }

      // Call register from auth service
      const userData = await authService.register({
        username,
        password,
        confirmPassword,
        role,
      });

      // Update user state
      setUser(userData);

      return { success: true };
    } catch (err) {
      console.error(&quot;Registration error:&quot;, err);
      setError(
        err instanceof Error
          ? err
          : new Error(&quot;Unknown error during registration&quot;),
      );

      return {
        success: false,
        error:
          err instanceof Error ? err.message : &quot;An unexpected error occurred&quot;,
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
