/**
 * Organization Context Utilities
 *
 * This module provides utilities for working with organization context in API routes.
 * It helps extract and validate organization context information from request headers.
 */
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// Define the organization context type
export interface OrganizationContext {
  organizationId: string;
  userRole?: string;
  organizationRole?: string;
  userId?: string;
}

// Define the organization header data type
export interface OrganizationData {
  id: string;
  name: string;
  type: string;
}

// Header constants
export const ORGANIZATION_CONTEXT_HEADER = "X-Organization-ID";
export const ORGANIZATION_NAME_HEADER = "X-Organization-Name";
export const ORGANIZATION_TYPE_HEADER = "X-Organization-Type";

/**
 * Get the organization context from the current request
 *
 * @returns The organization context or null if not available
 */
export function getOrganizationContext(): OrganizationContext | null {
  try {
    // Use the headers() function to get request headers - this returns headers directly, not a Promise
    const headersList = headers();

    // Get the organization ID from the headers
    const organizationId = headersList.get(ORGANIZATION_CONTEXT_HEADER);

    // If no organization ID is available, return null
    if (!organizationId) {
      return null;
    }

    // Get additional context information
    const userId = headersList.get("X-User-ID") || undefined;
    const userRole = headersList.get("X-User-Role") || undefined;
    const organizationRole =
      headersList.get("X-Organization-Role") || undefined;

    // Return the organization context
    return {
      organizationId,
      userId,
      userRole,
      organizationRole,
    };
  } catch (error) {
    console.error("Error getting organization context:", error);
    return null;
  }
}

/**
 * Get the organization data from the request headers
 *
 * @param req The NextRequest object
 * @returns OrganizationData or null if not available
 */
export async function getOrganizationHeaderData(
  req: NextRequest,
): Promise<OrganizationData | null> {
  try {
    // Get organization data from request headers
    const id = req.headers.get(ORGANIZATION_CONTEXT_HEADER);
    const name = req.headers.get(ORGANIZATION_NAME_HEADER);
    const type = req.headers.get(ORGANIZATION_TYPE_HEADER);

    if (!id || !name || !type) {
      return null;
    }

    return {
      id,
      name,
      type,
    };
  } catch (e) {
    console.error("Error getting organization header data:", e);
    return null;
  }
}

/**
 * Require organization context from the current request
 *
 * This function is similar to getOrganizationContext, but throws an error
 * if the organization context is not available. Use this in API routes
 * that require organization context to be present.
 *
 * @returns The organization context
 * @throws Error if the organization context is not available
 */
export function requireOrganizationContext(): OrganizationContext {
  const context = getOrganizationContext();

  if (!context) {
    throw new Error("Organization context is required but not available");
  }

  return context;
}

/**
 * Check if a user has a specific permission in the current organization
 *
 * @param permission The permission to check
 * @returns True if the user has the permission, false otherwise
 */
export async function hasOrganizationPermission(
  permission: string,
): Promise<boolean> {
  try {
    const context = getOrganizationContext();

    // If no context is available, the user doesn't have the permission
    if (!context) {
      return false;
    }

    // Super admins have all permissions
    if (context.userRole === "super_admin") {
      return true;
    }

    // In development mode, always grant permissions for testing
    if ((process.env.NODE_ENV as string) === "development") {
      console.log(
        `DEVELOPMENT MODE: Granting permission '${permission}' in organization ${context.organizationId}`,
      );
      return true;
    }

    // In a real app, we would check against stored organization-specific permissions
    // Production implementation - get organization data from headers
    return false;
  } catch (error) {
    console.error("Error checking organization permission:", error);
    return false;
  }
}
