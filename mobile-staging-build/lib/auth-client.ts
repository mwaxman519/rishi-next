/**
 * Client-side Authentication Utilities
 *
 * This module provides client-side authentication and authorization utilities
 * that support multi-organization functionality, including:
 *
 * 1. JWT token signing and management
 * 2. Permission checking within organization contexts
 * 3. Client-side authorization helpers
 *
 * These utilities are used by the OrganizationProvider and other components
 * to implement organization context switching and permission-based UI elements.
 */
import { JwtPayload } from "@/shared/types";

/**
 * Sign a JWT token with payload
 * For development purposes, this simply returns the stringified payload
 * In production, this would use jose or a similar library to sign the token
 */
export async function signJwt(payload: JwtPayload): Promise<string> {
  // For development, we'll just return the stringified payload
  // In production, this would sign the payload with a secret key
  if (process.env.NODE_ENV === "development") {
    return JSON.stringify(payload);
  }

  // In production, this would use jose or similar
  // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  // return await new jose.SignJWT(payload)
  //   .setProtectedHeader({ alg: 'HS256' })
  //   .setIssuedAt()
  //   .setExpirationTime('30d')
  //   .sign(secret);

  // For now, just return the stringified payload
  return JSON.stringify(payload);
}

/**
 * Check if the current user has a specific permission
 *
 * This function verifies if the current user has a specified permission,
 * optionally within a specific organization context. It supports:
 *
 * - Global permission checks (e.g., 'view:admin')
 * - Organization-specific permission checks (e.g., 'edit:events' in organization X)
 *
 * @param permission - The permission string to check (format: 'action:resource')
 * @param organizationId - Optional organization UUID to check permissions within
 * @returns Promise<boolean> indicating if user has the specified permission
 */
export async function hasPermission(
  permission: string,
  organizationId?: string,
): Promise<boolean> {
  try {
    // In a real implementation, this would call an API endpoint
    // to check if the user has the specified permission

    // Production implementation - validate role against actual permissions
    // In production, this would check against the backend
    if (process.env.NODE_ENV === "development") {
      console.log(
        `DEV MODE: Permission check for ${permission}${organizationId ? ` in org ${organizationId}` : ""} => true`,
      );
      return true;
    }

    // Real implementation would call the API
    const response = await fetch(
      `/api/permissions/check?permission=${permission}${organizationId ? `&organizationId=${organizationId}` : ""}`,
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasPermission === true;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}
