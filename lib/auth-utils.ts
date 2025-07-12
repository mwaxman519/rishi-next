/**
 * This file provides a unified interface for authentication utilities
 * by re-exporting functions from the appropriate auth module based on the runtime
 */

import type { JwtPayload } from "./auth-server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/shared/rbac/roles";

// Export all server-side functions
export { hashPassword, comparePasswords } from "./auth-server";

// Export types properly with export type
export type { JwtPayload } from "./auth-server";

/**
 * Verifies a JWT token and returns the payload if valid
 *
 * @param token The JWT token to verify
 * @returns The JWT payload if valid, null otherwise
 */
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    // Get the JWT secret from environment variables
    const secret = process.env.JWT_SECRET || "development_secret_key";

    // Verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    // Convert the jose payload to our JwtPayload type
    const customPayload: JwtPayload = {
      id: payload.id as number,
      username: payload.username as string,
      role: payload.role as UserRole,
      fullName: payload.fullName as string | undefined,
    };

    return customPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Gets the current user from the auth token in cookies
 *
 * @returns The current user if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    // Verify the token
    return verifyJwt(token);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
