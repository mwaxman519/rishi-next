/**
 * Auth Service Client Hook
 *
 * This hook provides a client for interacting with the auth microservice.
 */
"use client";

import { useState } from "react";

// Response type definitions
interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  service: string;
  version: string;
}

// User types
interface UserOrganization {
  orgId: string;
  orgName: string;
  orgType: string;
  tier?: string;
  role: string;
  isDefault: boolean;
}

interface UserSession {
  id: string;
  username: string;
  email?: string;
  name?: string; // For backward compatibility
  fullName?: string;
  role?: string;
  organizationId?: string;
  image?: string | null;
  roles?: string[];
  organizations?: UserOrganization[];
  currentOrganization?: UserOrganization;
}

interface SessionInfo {
  user: UserSession | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  registrationPasscode?: string;
}

interface AuthServiceClient {
  login: (credentials: LoginCredentials) => Promise<UserSession>;
  register: (data: RegisterData) => Promise<UserSession>;
  logout: () => Promise<void>;
  getSession: () => Promise<SessionInfo>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for interacting with the auth microservice
 */
export function useAuthService(): AuthServiceClient {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generic function to make requests to the auth service
   */
  async function authRequest<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: any,
  ): Promise<T> {
    try {
      setIsLoading(true);
      setError(null);

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(
        `/api/auth-service/${endpoint}`,
        options,
      );
      const result: AuthResponse<T> = await response.json();

      if (!response.ok || !result.success) {
        // Log the full error response for debugging
        console.error(`Auth service ${endpoint} error response:`, result);

        // Extract detailed error messages
        const errorMessage =
          result.error?.message || `Request to ${endpoint} failed`;
        const errorDetails = result.error?.details;

        // Log structured error details if available
        if (errorDetails) {
          console.error("Error details:", errorDetails);
        }

        throw new Error(errorMessage);
      }

      return result.data as T;
    } catch (err) {
      console.error(`Auth service ${endpoint} error:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Login a user
   */
  async function login(credentials: LoginCredentials): Promise<UserSession> {
    try {
      console.log(`Attempting login for user: ${credentials.username}`);

      // Always use real authentication - no fallback mode
      const userData = await authRequest<UserSession>(
        "login",
        "POST",
        credentials,
      );
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  }

  /**
   * Register a new user
   */
  async function register(data: RegisterData): Promise<UserSession> {
    try {
      // Password confirmation check
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      // Transform the data to match the expected format if firstName/lastName provided
      if (data.firstName && data.lastName && !data.fullName) {
        data.fullName = `${data.firstName} ${data.lastName}`;
      }

      // Always use real authentication - no fallback mode

      // Prepare clean data object for registration
      const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        role: data.role || "brand_agent",
      };

      // Check database status endpoint
      // Our updated endpoint will always return success with diagnostic info
      try {
        const statusResponse = await fetch("/api/auth-service/status", {
          method: "GET",
          signal: new AbortController().signal,
        });

        // Log the status response but never fail the registration process
        // based on status check alone (we'll let the registration API handle errors)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log("Auth service status check result:", statusData);
        }
      } catch (statusError) {
        // Only log this error, never fail the registration based on status check
        console.warn(
          "Status check failed, proceeding with registration anyway",
        );
      }

      // No need to add hardcoded passcode since it's now coming from the form

      // Create safe data object for logging
      const safeData = { ...registrationData };

      // Redact sensitive information
      if ("password" in safeData) safeData.password = "[REDACTED]";
      if ("confirmPassword" in safeData)
        safeData.confirmPassword = "[REDACTED]";
      if ("registrationPasscode" in safeData)
        (safeData as any).registrationPasscode = "[REDACTED]";

      // Send the registration request with appropriate logging
      console.log("Sending registration request:", safeData);

      // Add timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        // Make the request with custom error handling for production issues
        const response = await fetch(`/api/auth-service/routes/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-success status codes
        if (!response.ok) {
          // Try to get the error message from the response
          let errorMessage = "Registration failed";
          let errorData: any = null;

          try {
            errorData = await response.json();
            console.error("Auth service register error response:", errorData);

            // Extract error message from response
            if (errorData.error) {
              if (
                typeof errorData.error === "object" &&
                errorData.error.message
              ) {
                errorMessage = errorData.error.message;
              } else {
                errorMessage = errorData.error;
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            // Handle JSON parsing errors (e.g., when no valid JSON is returned)
            console.error(
              "Auth service register error: Failed to parse response",
              parseError,
            );

            // Use status code for error message if we can't parse JSON
            if (response.status === 502) {
              errorMessage =
                "Registration service is unavailable (Bad Gateway). Please try again later.";
            } else if (response.status === 500) {
              errorMessage =
                "Registration service encountered an error. Please try again later.";
            } else {
              errorMessage = `Registration failed with status: ${response.status} ${response.statusText}`;
            }
          }

          // Specific error handling for database issues we've seen in production
          if (
            errorMessage.includes("database") ||
            errorMessage.includes("Database") ||
            errorMessage.includes("connection") ||
            errorMessage.includes("not been initialized")
          ) {
            throw new Error(
              "Database error: The registration service is experiencing database issues. Please try again later.",
            );
          }

          throw new Error(errorMessage);
        }

        // Parse successful response
        const userData = await response.json();
        console.log("Registration successful, user data:", {
          ...userData,
          // Don't log sensitive data
          password: undefined,
        });

        return userData;
      } catch (requestError: any) {
        clearTimeout(timeoutId);

        // Handle request errors with clear messages
        if (requestError.name === "AbortError") {
          throw new Error(
            "Registration request timed out. Please try again later.",
          );
        }

        // Pass along the existing error
        throw requestError;
      }

      // This line should never be reached due to try/catch
      throw new Error("Unexpected error in registration");
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  }

  /**
   * Logout the current user
   */
  async function logout(): Promise<void> {
    try {
      console.log("Attempting logout");
      // Always use real authentication - no fallback mode
      await authRequest<void>("logout", "POST");
      console.log("Logout successful");

      // Force page reload to clear all client-side state
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Even if logout fails, redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw err;
    }
  }

  /**
   * Get the current session information
   */
  async function getSession(): Promise<SessionInfo> {
    try {
      // Always use real authentication - no fallback mode
      return await authRequest<SessionInfo>("session");
    } catch (err) {
      console.error("Get session error:", err);
      return { user: null };
    }
  }

  return {
    login,
    register,
    logout,
    getSession,
    isLoading,
    error,
  };
}

export type { UserSession, SessionInfo, LoginCredentials, RegisterData };
