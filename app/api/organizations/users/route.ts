import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/app/lib/auth";
import { db } from "@db";
import { users, userOrganizations } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { hasPermission } from "@/lib/rbac";

/**
 * GET /api/organizations/users
 *
 * Retrieves all users for an organization
 *
 * Required query parameters:
 * - organizationId: ID of the organization to get users for
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to view organization users
    // Ensure the user belongs to this organization or is a super admin
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      if (!userOrg && !hasPermission("view:all_organizations", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to view users for this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions
      if (!hasPermission("view:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to view users" },
          { status: 403 },
        );
      }
    }

    // For development, return mock users
    if (process.env.NODE_ENV !== "production") {
      console.log("DEVELOPMENT MODE: Using mock organization users data");

      const mockUsers = [
        {
          id: "1",
          name: "Mike Johnson",
          email: "mike@rishi.com",
          role: "super_admin",
          is_primary: true,
          avatar_url: null,
        },
        {
          id: "2",
          name: "Sarah Williams",
          email: "sarah@rishi.com",
          role: "internal_admin",
          is_primary: false,
          avatar_url: null,
        },
        {
          id: "3",
          name: "Thomas Carter",
          email: "thomas@rishi.com",
          role: "internal_field_manager",
          is_primary: false,
          avatar_url: null,
        },
      ];

      return NextResponse.json({ users: mockUsers });
    }

    // In production, get actual users from database
    try {
      // Get all users for this organization
      // Convert organizationId to string to match schema
      const orgIdStr = String(organizationId);

      const orgUsers = await db.query.userOrganizations.findMany({
        where: eq(userOrganizations.organizationId, orgIdStr),
        with: {
          user: true,
        },
      });

      // Format the result
      const formattedUsers = orgUsers.map((orgUser) => ({
        id: orgUser.userId,
        name: orgUser.user.fullName || orgUser.user.username,
        email: orgUser.user.email,
        role: orgUser.role,
        is_primary: orgUser.isPrimary,
        // Use profileImage instead of avatarUrl to match schema
        avatar_url: orgUser.user.profileImage,
        title: orgUser.title,
        department: orgUser.department,
      }));

      return NextResponse.json({ users: formattedUsers });
    } catch (dbError) {
      console.error("Database error fetching organization users:", dbError);

      // If database error in development, return mock data
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          users: [],
          error: "Database error in development, returning empty list",
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization users" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizations/users
 *
 * Removes a user from an organization
 *
 * Required query parameters:
 * - userId: ID of the user to remove
 * - organizationId: ID of the organization to remove the user from
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get userId and organizationId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "User ID and Organization ID are required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to remove users from organization
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      // User must belong to the organization or be a super admin
      if (!userOrg && !hasPermission("manage:all", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to remove users from this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission("manage:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to manage users" },
          { status: 403 },
        );
      }
    }

    // Prevent users from removing themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from an organization" },
        { status: 400 },
      );
    }

    // Check if the user being removed has this as their primary organization
    const userOrgToRemove = await db.query.userOrganizations.findFirst({
      where: (userOrg, { and, eq }) =>
        and(
          eq(userOrg.userId, userId),
          eq(userOrg.organizationId, organizationId),
        ),
    });

    if (!userOrgToRemove) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 404 },
      );
    }

    // If this is the user's primary organization, prevent removal
    if (userOrgToRemove.isPrimary) {
      return NextResponse.json(
        { error: "Cannot remove a user from their primary organization" },
        { status: 400 },
      );
    }

    // For development mode, return success without actual deletion
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `DEVELOPMENT MODE: Would remove user ${userId} from organization ${organizationId}`,
      );
      return NextResponse.json({ success: true });
    }

    // In production, remove user from organization
    try {
      await db
        .delete(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, userId),
            eq(userOrganizations.organizationId, organizationId),
          ),
        );

      return NextResponse.json({
        success: true,
        message: "User removed from organization successfully",
      });
    } catch (dbError) {
      console.error("Database error removing user from organization:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error removing user from organization:", error);
    return NextResponse.json(
      { error: "Failed to remove user from organization" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizations/users
 *
 * Adds an existing user to an organization
 *
 * Required body parameters:
 * - userId: ID of the user to add
 * - organizationId: ID of the organization to add the user to
 * - role: Role the user will have in the organization
 * - isPrimary: Whether this is the user's primary organization
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { userId, organizationId, role, isPrimary, title, department } = body;

    if (!userId || !organizationId || !role) {
      return NextResponse.json(
        { error: "User ID, Organization ID and Role are required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to add users to organization
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      // User must belong to the organization or be a super admin
      if (!userOrg && !hasPermission("manage:all", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to add users to this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission("manage:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to manage users" },
          { status: 403 },
        );
      }
    }

    // Check if the user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is already a member of this organization
    const existingUserOrg = await db.query.userOrganizations.findFirst({
      where: (userOrg, { and, eq }) =>
        and(
          eq(userOrg.userId, userId),
          eq(userOrg.organizationId, organizationId),
        ),
    });

    if (existingUserOrg) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 },
      );
    }

    // If setting as primary, we need to update all other organizations for this user
    if (isPrimary) {
      // For development mode, just log this operation
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `DEVELOPMENT MODE: Would update all other organizations for user ${userId} to non-primary`,
        );
      } else {
        // In production, update all existing org memberships to non-primary
        await db
          .update(userOrganizations)
          .set({ isPrimary: false })
          .where(eq(userOrganizations.userId, userId));
      }
    }

    // For development mode, return success without actual insertion
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `DEVELOPMENT MODE: Would add user ${userId} to organization ${organizationId} with role ${role}`,
      );
      return NextResponse.json({
        success: true,
        userOrganization: {
          userId,
          organizationId,
          role,
          isPrimary: isPrimary || false,
          title: title || null,
          department: department || null,
        },
      });
    }

    // In production, add user to organization
    try {
      const result = await db
        .insert(userOrganizations)
        .values({
          userId,
          organizationId,
          role,
          isPrimary: isPrimary || false,
          title: title || null,
          department: department || null,
        })
        .returning();

      const createdUserOrg = result[0];
      if (!createdUserOrg) {
        throw new Error('Failed to add user to organization - no result returned');
      }
      return NextResponse.json({
        success: true,
        userOrganization: createdUserOrg,
      });
    } catch (dbError) {
      console.error("Database error adding user to organization:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error adding user to organization:", error);
    return NextResponse.json(
      { error: "Failed to add user to organization" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/organizations/users
 *
 * Updates a user's role or settings in an organization
 *
 * Required body parameters:
 * - userId: ID of the user to update
 * - organizationId: ID of the organization
 * - updates: Object containing fields to update (role, isPrimary, title, department)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get the current user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { userId, organizationId, updates } = body;

    if (
      !userId ||
      !organizationId ||
      !updates ||
      Object.keys(updates).length === 0
    ) {
      return NextResponse.json(
        { error: "User ID, Organization ID and updates are required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to update users in organization
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      // User must belong to the organization or be a super admin
      if (!userOrg && !hasPermission("manage:all", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to update users in this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission("manage:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to manage users" },
          { status: 403 },
        );
      }
    }

    // Check if the user-organization relationship exists
    const existingUserOrg = await db.query.userOrganizations.findFirst({
      where: (userOrg, { and, eq }) =>
        and(
          eq(userOrg.userId, userId),
          eq(userOrg.organizationId, organizationId),
        ),
    });

    if (!existingUserOrg) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 404 },
      );
    }

    // If updating to primary, we need to update all other organizations for this user
    if (updates.isPrimary) {
      // For development mode, just log this operation
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `DEVELOPMENT MODE: Would update all other organizations for user ${userId} to non-primary`,
        );
      } else {
        // In production, update all existing org memberships to non-primary
        await db
          .update(userOrganizations)
          .set({ isPrimary: false })
          .where(eq(userOrganizations.userId, userId));
      }
    }

    // For development mode, return success without actual update
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `DEVELOPMENT MODE: Would update user ${userId} in organization ${organizationId} with:`,
        updates,
      );
      return NextResponse.json({
        success: true,
        userOrganization: {
          ...existingUserOrg,
          ...updates,
        },
      });
    }

    // In production, update user organization
    try {
      const result = await db
        .update(userOrganizations)
        .set({
          ...updates,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(userOrganizations.userId, userId),
            eq(userOrganizations.organizationId, organizationId),
          ),
        )
        .returning();

      const updatedUserOrg = result[0];
      if (!updatedUserOrg) {
        throw new Error('Failed to update user organization - no result returned');
      }
      return NextResponse.json({
        success: true,
        userOrganization: updatedUserOrg,
      });
    } catch (dbError) {
      console.error("Database error updating user in organization:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error updating user in organization:", error);
    return NextResponse.json(
      { error: "Failed to update user in organization" },
      { status: 500 },
    );
  }
}
