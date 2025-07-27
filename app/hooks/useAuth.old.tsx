"use client";

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

import { useState, useEffect, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";

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
    console.error("Login not implemented in default context");
    return false;
  },
  register: async () => {
    console.error("Register not implemented in default context");
    return { success: false, error: "Registration not implemented" };
  },
});

// Utility functions
export function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    console.error("Error decoding token:", e);
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
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;
        const showUnauthenticated =
          urlParams?.get("unauthenticated") === "true";

        // In development, use a mock user unless explicitly showing unauthenticated state
        // BUT ONLY IN DEVELOPMENT MODE - not in production
        if (process.env.NODE_ENV === "development" && !showUnauthenticated) {
          console.log("DEVELOPMENT MODE: Using mock user for testing");
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          setUser({
            id: "00000000-0000-0000-0000-000000000001",
            email: "admin@example.com",
            name: "Admin User",
            role: "super_admin",
            organizationId: "00000000-0000-0000-0000-000000000001",
            roles: ["SUPER_ADMIN"],
          });
          setIsLoading(false);
          return;
        }

        // If showing unauthenticated state
        if (showUnauthenticated) {
          console.log("DEVELOPMENT MODE: Showing unauthenticated view");
          setUser(null);
          setIsLoading(false);
          return;
        }

        // In production, would fetch from /api/auth/session
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to load user session");
        }

        const data = await response.json();
        setUser(data.user || null);
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
      // Call logout API
      if (process.env.NODE_ENV !== "development") {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }
      } else {
        console.log("DEVELOPMENT MODE: Logging out user");
      }

      // Clear user state
      setUser(null);

      // Redirect to login page or home page
      if (typeof window !== "undefined") {
        // For development, add the unauthenticated parameter
        if (process.env.NODE_ENV === "development") {
          console.log("DEVELOPMENT MODE: Redirecting to unauthenticated view");
          window.location.href = "/?unauthenticated=true";
        } else {
          // In production, redirect to login
          window.location.href = "/auth/login";
        }
      }
    } catch (err) {
      console.error("Error during logout:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error during logout"),
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
      if (process.env.NODE_ENV === "development") {
        console.log("DEVELOPMENT MODE: Simulating successful login");
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser({
          id: "00000000-0000-0000-0000-000000000001",
          email: username.includes("@") ? username : `${username}@example.com`,
          name: "Admin User",
          role: "super_admin",
          organizationId: "00000000-0000-0000-0000-000000000001",
          roles: ["SUPER_ADMIN"],
        });

        return true;
      }

      // In production, would call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
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
  ): Promise<RegisterResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Password validation
      if (password !== confirmPassword) {
        return { success: false, error: "Passwords do not match" };
      }

      // In development mode, simulate successful registration
      if (process.env.NODE_ENV === "development") {
        console.log("DEVELOPMENT MODE: Simulating successful registration");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setUser({
          id: "00000000-0000-0000-0000-000000000001",
          email: username.includes("@") ? username : `${username}@example.com`,
          name: "New User",
          role: role || "brand_agent",
          organizationId: "00000000-0000-0000-0000-000000000001",
          roles: [role.toUpperCase()],
        });

        return { success: true };
      }

      // In production, call the registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Registration failed, please try again",
        };
      }

      const data = await response.json();
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Unknown error during registration"),
      );
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
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
