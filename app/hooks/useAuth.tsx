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

"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  useAuthService,
  UserSession,
  LoginCredentials,
  RegisterData,
} from "./useAuthService";

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
    console.error("Login not implemented in default context");
    return false;
  },
  register: async () => {
    console.error("Register not implemented in default context");
    return { success: false, error: "Registration not implemented" };
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
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    async function loadUser() {
      try {
        setIsLoading(true);

        // Add small delay if in iframe to prevent rendering issues
        const isInIframe = window.self !== window.top;
        if (isInIframe) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Get session from auth service
        const { user: sessionUser } = await authService.getSession();
        setUser(sessionUser);
      } catch (err) {
        console.error("Error loading user:", err);
        setError(
          err instanceof Error ? err : new Error("Unknown error loading user"),
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
      user.role === "super_admin" ||
      (user.roles && user.roles.includes("SUPER_ADMIN"))
    ) {
      return true;
    }

    // Development mode: grant all permissions
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    // In a real implementation, would check against stored permissions
    // This is a placeholder
    return false;
  };

  // Helper properties to identify user types
  const isRishiManagement =
    user?.role === "internal_admin" || user?.role === "super_admin";
  const isFieldManager = user?.role === "internal_field_manager";
  const isBrandAgent = user?.role === "brand_agent";
  const isClientUser = user?.role === "client_user";
  const isSuperAdmin = user?.role === "super_admin";

  // Logout function implementation
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Call logout from auth service
      await authService.logout();

      // Clear user state
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error during logout"),
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
          console.error("Session refresh error:", refreshError);
        }
      }, 100);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error during login"),
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
        return { success: false, error: "Passwords do not match" };
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

        // Only add the passcode if it's provided
        if (registrationPasscode) {
          (registerData as any).registrationPasscode = registrationPasscode;
        }

        const userData = await authService.register(registerData);

        // Update user state
        setUser(userData);

        return { success: true };
      } catch (serviceError: any) {
        console.error("Auth service registration error:", serviceError);

        // Create user-friendly error messages based on the error type
        let errorMessage = serviceError.message || "Registration failed";

        // Handle network errors
        if (
          serviceError.name === "TypeError" &&
          serviceError.message.includes("Failed to fetch")
        ) {
          errorMessage =
            "Cannot connect to the registration service. Please check your internet connection.";
        }
        // Handle database errors
        else if (
          errorMessage.includes("database") ||
          errorMessage.includes("Database") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("not been initialized")
        ) {
          errorMessage =
            "The registration system is currently experiencing database issues. Please try again later.";
        }
        // Handle Bad Gateway errors
        else if (
          errorMessage.includes("502") ||
          errorMessage.includes("Bad Gateway")
        ) {
          errorMessage =
            "The registration service is temporarily unavailable. Our team has been notified.";
        }
        // Handle JSON parsing errors
        else if (
          errorMessage.includes("JSON") ||
          errorMessage.includes("Unexpected end")
        ) {
          errorMessage =
            "The registration service returned an invalid response. Please try again later.";
        }
        // Handle timeout errors
        else if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("timed out")
        ) {
          errorMessage =
            "The registration request timed out. Please try again later.";
        }

        setError(new Error(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration";
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
