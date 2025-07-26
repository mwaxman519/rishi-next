/**
 * Server-side organization utility functions
 * Used for fetching organization data from the server
 */
import { db } from "@/lib/db";
import { organizations, organizationUsers } from "@/shared/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentAuthUser } from "./auth-server";

/**
 * Retrieves all organizations associated with a user
 */
export async function getUserOrganizations(userId: string) {
  if (!userId) return [];

  try {
    // Join organization_users with organizations table to get full organization details
    const userOrgs = await db.query.organizationUsers.findMany({
      where: eq(organizationUsers.user_id, userId),
      with: {
        organization: true,
      },
    });

    return userOrgs;
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }
}

/**
 * Checks if a user belongs to a specific organization
 */
export async function isUserInOrganization(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  if (!userId || !organizationId) return false;

  try {
    const userOrg = await db.query.organizationUsers.findFirst({
      where: and(
        eq(organizationUsers.user_id, userId),
        eq(organizationUsers.organization_id, organizationId),
      ),
    });

    return !!userOrg;
  } catch (error) {
    console.error("Error checking user organization membership:", error);
    return false;
  }
}

/**
 * Gets a user's primary organization
 */
export async function getUserPrimaryOrganization(userId: string) {
  if (!userId) return null;

  try {
    const primaryOrg = await db.query.organizationUsers.findFirst({
      where: and(
        eq(organizationUsers.user_id, userId),
        eq(organizationUsers.is_primary, true),
      ),
      with: {
        organization: true,
      },
    });

    return primaryOrg ? primaryOrg.organization : null;
  } catch (error) {
    console.error("Error fetching user primary organization:", error);
    return null;
  }
}

/**
 * Gets an organization by ID
 */
export async function getOrganizationById(organizationId: string) {
  if (!organizationId) return null;

  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    return org;
  } catch (error) {
    console.error(`Error fetching organization ${organizationId}:`, error);
    return null;
  }
}
