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

      console.log(`[Auth Service] Making ${method} request to ${endpoint}`);

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
      };

      if (data) {
        options.body = JSON.stringify(data);
        console.log(`[Auth Service] Request data keys:`, Object.keys(data));
      }

      let response;
      try {
        console.log(`[Auth Service] About to fetch: /api/auth-service/${endpoint}`);
        response = await fetch(
          `/api/auth-service/${endpoint}`,
          options,
        );
        console.log(`[Auth Service] Fetch completed successfully`);
      } catch (fetchError) {
        console.error(`[Auth Service] Fetch failed:`, fetchError);
        console.error(`[Auth Service] Fetch error type:`, typeof fetchError);
        console.error(`[Auth Service] Fetch error keys:`, Object.keys(fetchError || {}));
        console.error(`[Auth Service] Fetch error stringified:`, JSON.stringify(fetchError));
        throw new Error(`Network error for ${endpoint}: ${fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError)}`);
      }

      console.log(`[Auth Service] Response status:`, response.status);
      console.log(`[Auth Service] Response ok:`, response.ok);

      if (!response.ok) {
        console.error(`[Auth Service] ${endpoint} HTTP error:`, response.status, response.statusText);
        
        // Try to get response body for debugging
        try {
          const errorText = await response.text();
          console.error(`[Auth Service] Error response body:`, errorText);
        } catch (e) {
          console.error(`[Auth Service] Could not read error response body`);
        }
        
        throw new Error(`Request to ${endpoint} failed with status ${response.status}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log(`[Auth Service] Raw response:`, responseText);

      if (!responseText || responseText.trim() === '') {
        console.error(`[Auth Service] ${endpoint} returned empty response`);
        throw new Error(`Auth service ${endpoint} returned empty response`);
      }

      let result: AuthResponse<T>;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[Auth Service] Failed to parse JSON response:`, parseError);
        console.error(`[Auth Service] Response text:`, responseText);
        throw new Error(`Auth service ${endpoint} returned invalid JSON`);
      }

      console.log(`[Auth Service] Parsed response:`, {
        success: result.success,
        hasData: !!result.data,
        hasError: !!result.error,
        service: result.service
      });

      // Check if the response is completely empty or malformed
      if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
        console.error(`[Auth Service] ${endpoint} returned empty parsed response:`, result);
        console.error(`[Auth Service] Original response text:`, responseText);
        console.error(`[Auth Service] Response text length:`, responseText?.length);
        console.error(`[Auth Service] Response text type:`, typeof responseText);
        
        // If we have response text but parsing failed, this is a JSON issue
        if (responseText && responseText.trim()) {
          throw new Error(`Auth service ${endpoint} JSON parse resulted in empty object. Raw response: ${responseText.substring(0, 200)}`);
        } else {
          throw new Error(`Auth service ${endpoint} returned completely empty response`);
        }
      }

      // Validate response structure
      if (typeof result.success === 'undefined') {
        console.error(`[Auth Service] ${endpoint} response missing success field:`, result);
        throw new Error(`Auth service ${endpoint} returned malformed response`);
      }

      if (!result.success) {
        // Log the full error response for debugging
        console.error(`[Auth Service] ${endpoint} error response:`, result);

        // Extract detailed error messages
        const errorMessage =
          result.error?.message || `Request to ${endpoint} failed`;
        const errorDetails = result.error?.details;

        // Log structured error details if available
        if (errorDetails) {
          console.error("[Auth Service] Error details:", errorDetails);
        }

        throw new Error(errorMessage);
      }

      console.log(`[Auth Service] ${endpoint} request successful`);
      console.log(`[Auth Service] ${endpoint} returning data:`, result.data);
      console.log(`[Auth Service] ${endpoint} data type:`, typeof result.data);
      console.log(`[Auth Service] ${endpoint} data keys:`, Object.keys(result.data || {}));
      
      // Ensure we don't return undefined or null without notice
      if (result.data === undefined || result.data === null) {
        console.warn(`[Auth Service] ${endpoint} returned null/undefined data`);
        // For session endpoint, return proper structure instead of empty object
        if (endpoint === 'session') {
          return { user: null } as T;
        }
        return {} as T;
      }
      
      return result.data as T;
    } catch (err) {
      console.error(`[Auth Service] ${endpoint} error:`, err);
      console.error(`[Auth Service] ${endpoint} error type:`, typeof err);
      console.error(`[Auth Service] ${endpoint} error keys:`, Object.keys(err || {}));
      
      let errorToThrow: Error;
      if (err instanceof Error) {
        errorToThrow = err;
      } else if (typeof err === 'string') {
        errorToThrow = new Error(err);
      } else if (err && typeof err === 'object') {
        // Handle case where err is an empty object {}
        const errStr = JSON.stringify(err);
        if (errStr === '{}') {
          errorToThrow = new Error(`Auth service ${endpoint} error: Unknown error occurred`);
        } else {
          errorToThrow = new Error(`Auth service ${endpoint} error: ${errStr}`);
        }
      } else {
        errorToThrow = new Error(`Auth service ${endpoint} error: ${String(err)}`);
      }
      
      console.error(`[Auth Service] Final error to throw:`, errorToThrow.message);
      setError(errorToThrow);
      throw errorToThrow;
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
      console.log("[Auth Service] getSession - starting request");
      // Always use real authentication - no fallback mode
      const result = await authRequest<SessionInfo>("session");
      console.log("[Auth Service] getSession - result:", result);
      console.log("[Auth Service] getSession - result type:", typeof result);
      console.log("[Auth Service] getSession - result keys:", Object.keys(result || {}));
      
      // Ensure we return a proper SessionInfo structure
      if (!result || typeof result !== 'object') {
        console.warn("[Auth Service] getSession - invalid result, returning default");
        return { user: null };
      }
      
      return result;
    } catch (err) {
      console.error("Get session error:", err);
      console.error("Get session error type:", typeof err);
      console.error("Get session error keys:", Object.keys(err || {}));
      // Return default structure if session fails
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
