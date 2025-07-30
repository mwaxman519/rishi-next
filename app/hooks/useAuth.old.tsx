&quot;use client&quot;;

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
 * - The system calls real API endpoints for authentication
 * - Sessions are persisted via HTTP cookies set by the backend
 * - Proper security checks are enforced
 */

import { useState, useEffect, createContext, useContext } from &quot;react&quot;;
import { jwtDecode } from &quot;jwt-decode&quot;;

// Define our own UserSession type based on the mock user in auth.ts
export interface UserSession {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  organizationId?: string;
  organizationName?: string;
  image?: string | null;
  roles?: string[];
}

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

// Utility functions
export function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    console.error(&quot;Error decoding token:&quot;, e);
    return true;
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        // Check for a URL parameter that allows toggling auth state for development/testing
        const urlParams =
          typeof window !== &quot;undefined&quot;
            ? new URLSearchParams(window.location.search)
            : null;
        const showUnauthenticated =
          urlParams?.get(&quot;unauthenticated&quot;) === &quot;true&quot;;

        // In development, use a mock user unless explicitly showing unauthenticated state
        // BUT ONLY IN DEVELOPMENT MODE - not in production
        if (process.env.NODE_ENV === &quot;development&quot; && !showUnauthenticated) {
          console.log(&quot;DEVELOPMENT MODE: Using mock user for testing&quot;);
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          setUser({
            id: &quot;00000000-0000-0000-0000-000000000001&quot;,
            email: &quot;admin@example.com&quot;,
            name: &quot;Admin User&quot;,
            role: &quot;super_admin&quot;,
            organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
            roles: [&quot;SUPER_ADMIN&quot;],
          });
          setIsLoading(false);
          return;
        }

        // If showing unauthenticated state
        if (showUnauthenticated) {
          console.log(&quot;DEVELOPMENT MODE: Showing unauthenticated view&quot;);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // In production, would fetch from /api/auth/session
        const response = await fetch(&quot;/api/auth/session&quot;);
        if (!response.ok) {
          throw new Error(&quot;Failed to load user session&quot;);
        }

        const data = await response.json();
        setUser(data.user || null);
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
      // Call logout API
      if (process.env.NODE_ENV !== &quot;development&quot;) {
        const response = await fetch(&quot;/api/auth/logout&quot;, {
          method: &quot;POST&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
        });

        if (!response.ok) {
          throw new Error(&quot;Logout failed&quot;);
        }
      } else {
        console.log(&quot;DEVELOPMENT MODE: Logging out user&quot;);
      }

      // Clear user state
      setUser(null);

      // Redirect to login page or home page
      if (typeof window !== &quot;undefined&quot;) {
        // For development, add the unauthenticated parameter
        if (process.env.NODE_ENV === &quot;development&quot;) {
          console.log(&quot;DEVELOPMENT MODE: Redirecting to unauthenticated view&quot;);
          window.location.href = &quot;/?unauthenticated=true&quot;;
        } else {
          // In production, redirect to login
          window.location.href = &quot;/auth/login&quot;;
        }
      }
    } catch (err) {
      console.error(&quot;Error during logout:&quot;, err);
      setError(
        err instanceof Error ? err : new Error(&quot;Unknown error during logout&quot;),
      );
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

      console.log(`Attempting login for user: ${username}`);

      // ONLY IN DEVELOPMENT MODE - not in production
      // In development mode, simulate successful login with mock user for easier testing
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(&quot;DEVELOPMENT MODE: Simulating successful login&quot;);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser({
          id: &quot;00000000-0000-0000-0000-000000000001&quot;,
          email: username.includes(&quot;@&quot;) ? username : `${username}@example.com`,
          name: &quot;Admin User&quot;,
          role: &quot;super_admin&quot;,
          organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
          roles: [&quot;SUPER_ADMIN&quot;],
        });

        return true;
      }

      // In production, would call the login API
      const response = await fetch(&quot;/api/auth/login&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || &quot;Login failed&quot;);
      }

      const data = await response.json();
      setUser(data.user);
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

      // In development mode, simulate successful registration
      if (process.env.NODE_ENV === &quot;development&quot;) {
        console.log(&quot;DEVELOPMENT MODE: Simulating successful registration&quot;);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser({
          id: &quot;00000000-0000-0000-0000-000000000001&quot;,
          email: username.includes(&quot;@&quot;) ? username : `${username}@example.com`,
          name: &quot;New User&quot;,
          role: role || &quot;brand_agent&quot;,
          organizationId: &quot;00000000-0000-0000-0000-000000000001&quot;,
          roles: [role.toUpperCase()],
        });

        return { success: true };
      }

      // In production, call the registration API
      const response = await fetch(&quot;/api/auth/register&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || &quot;Registration failed, please try again&quot;,
        };
      }

      const data = await response.json();
      setUser(data.user);
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
