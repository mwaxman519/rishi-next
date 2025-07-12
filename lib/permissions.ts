/**
 * Permissions utility functions for checking user access
 */
import { db } from "@/lib/db";
import { eq, and, or } from "drizzle-orm";
import { organizationUsers, organizations, users } from "@/shared/schema";
import {
  roleHasPermission,
  UserRole,
  USER_ROLES,
} from "@/shared/rbac/roles";

/**
 * Check if a user has a specific permission
 *
 * @param userId The user ID to check permissions for
 * @param permission The permission to check (format: 'action:resource')
 * @param organizationId Optional organization ID to check permissions within
 * @returns Promise<boolean> True if user has permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  permission: string,
  organizationId?: string,
): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    // Get user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.active) {
      return false;
    }

    // Special case: Super admins always have all permissions
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return true;
    }

    // Check if the permission is directly granted by the user's role
    const hasDirectPermission = roleHasPermission(
      user.role as string,
      permission,
    );

    // If no organization specified, just check direct permission
    if (!organizationId) {
      return hasDirectPermission;
    }

    // Verify user belongs to the organization
    const userOrg = await db.query.organizationUsers.findFirst({
      where: and(
        eq(organizationUsers.user_id, userId),
        eq(organizationUsers.organization_id, organizationId),
      ),
    });

    if (!userOrg) {
      return false;
    }

    // Check organizational permissions
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
    });

    if (!org || !org.active) {
      return false;
    }

    // For now, just return the direct permission check
    return hasDirectPermission;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Check if a user belongs to a specific organization
 *
 * @param userId The user ID to check
 * @param organizationId The organization ID to check
 * @returns Promise<boolean> True if user belongs to organization, false otherwise
 */
export async function userBelongsToOrganization(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  try {
    const userOrg = await db.query.organizationUsers.findFirst({
      where: and(
        eq(organizationUsers.user_id, userId),
        eq(organizationUsers.organization_id, organizationId),
      ),
    });

    return !!userOrg;
  } catch (error) {
    console.error("Error checking organization membership:", error);
    return false;
  }
}

/**
 * Get all organizations a user belongs to
 *
 * @param userId The user ID to get organizations for
 * @returns Promise<Array> List of organizations the user belongs to
 */
export async function getUserOrganizations(userId: string) {
  try {
    // Join organization_users with organizations to get full details
    const userOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        tier: organizations.tier,
        active: organizations.active,
        is_primary: organizationUsers.is_primary,
      })
      .from(organizationUsers)
      .innerJoin(
        organizations,
        eq(organizationUsers.organization_id, organizations.id),
      )
      .where(
        and(
          eq(organizationUsers.user_id, userId),
          eq(organizations.active, true),
        ),
      );

    return userOrgs;
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }
}

/**
 * Get a user's primary organization
 *
 * @param userId The user ID to get primary organization for
 * @returns Promise<Object|null> The primary organization or null if none found
 */
export async function getUserPrimaryOrganization(userId: string) {
  try {
    // First look for an organization marked as primary
    const primaryOrg = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        tier: organizations.tier,
        active: organizations.active,
      })
      .from(organizationUsers)
      .innerJoin(
        organizations,
        eq(organizationUsers.organization_id, organizations.id),
      )
      .where(
        and(
          eq(organizationUsers.user_id, userId),
          eq(organizationUsers.is_primary, true),
          eq(organizations.active, true),
        ),
      )
      .limit(1);

    if (primaryOrg.length > 0) {
      return primaryOrg[0];
    }

    // If no primary organization found, return the first active one
    const anyOrg = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        tier: organizations.tier,
        active: organizations.active,
      })
      .from(organizationUsers)
      .innerJoin(
        organizations,
        eq(organizationUsers.organization_id, organizations.id),
      )
      .where(
        and(
          eq(organizationUsers.user_id, userId),
          eq(organizations.active, true),
        ),
      )
      .limit(1);

    return anyOrg.length > 0 ? anyOrg[0] : null;
  } catch (error) {
    console.error("Error fetching primary organization:", error);
    return null;
  }
}
