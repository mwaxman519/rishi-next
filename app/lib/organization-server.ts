/**
 * Server-side organization utility functions
 * Used for fetching organization data from the server
 */
import { db } from &quot;../../lib/db-connection&quot;;
import { organizations, organizationUsers } from &quot;../../shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { getUser } from &quot;./auth-server&quot;;

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
    console.error(&quot;Error fetching user organizations:&quot;, error);
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
    console.error(&quot;Error checking user organization membership:&quot;, error);
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
    console.error(&quot;Error fetching user primary organization:&quot;, error);
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
