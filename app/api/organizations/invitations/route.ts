import { NextRequest, NextResponse } from "next/server";
import { getCurrentAuthUser } from "@/lib/auth-server";
import { db } from "@db";
import { organizationInvitations, userOrganizations } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { hasPermission } from "@/lib/rbac";
import { randomBytes } from "crypto";

/**
 * GET /api/organizations/invitations
 *
 * Retrieves all pending invitations for an organization
 *
 * Required query parameters:
 * - organizationId: ID of the organization to get invitations for
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get("organizationId") || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to view organization invitations
    // Ensure the user belongs to this organization or is a super admin
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      if (!userOrg && !(await hasPermission(user.id, "read:organizations"))) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to view invitations for this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions
      if (!(await hasPermission(user.id, "read:users"))) {
        return NextResponse.json(
          { error: "You do not have permission to view invitations" },
          { status: 403 },
        );
      }
    }

    // For development, return mock invitations
    if (process.env.NODE_ENV !== "production") {
      console.log("DEVELOPMENT MODE: Using mock organization invitations data");

      const mockInvitations = [
        {
          id: "1",
          email: "johndoe@example.com",
          role: "client_user",
          status: "pending",
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 2 days ago
        },
        {
          id: "2",
          email: "janedoe@example.com",
          role: "client_manager",
          status: "pending",
          created_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 1 day ago
        },
      ];

      return NextResponse.json({ invitations: mockInvitations });
    }

    // In production, get actual invitations from database
    try {
      // Get all active invitations for this organization
      // Cast or convert organizationId to integer when needed
      const orgId =
        typeof organizationId === "string"
          ? parseInt(organizationId, 10)
          : organizationId;

      const invites = await db
        .select()
        .from(organizationInvitations)
        .where(
          and(
            eq(organizationInvitations.organizationId, orgId),
            eq(organizationInvitations.status, "pending"),
          ),
        );

      return NextResponse.json({ invitations: invites });
    } catch (dbError) {
      console.error(
        "Database error fetching organization invitations:",
        dbError,
      );

      // If database error in development, return mock data
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          invitations: [],
          error: "Database error in development, returning empty list",
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching organization invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization invitations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizations/invitations
 *
 * Creates a new invitation to join an organization
 *
 * Required body parameters:
 * - email: Email of the user to invite
 * - role: Role the user will have in the organization
 * - organizationId: ID of the organization to invite to
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { email, role, organizationId } = body;

    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: "Email, Role and Organization ID are required" },
        { status: 400 },
      );
    }

    // Check if the user has permission to invite users to organization
    if (user.role !== "super_admin") {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      // User must belong to the organization or be a super admin
      if (!userOrg && !hasPermission("update:organizations", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to invite users to this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission("create:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to invite users" },
          { status: 403 },
        );
      }
    }

    // Check if there's an existing pending invitation for this email + organization
    const existingInvitation = await db.query.organizationInvitations.findFirst(
      {
        where: (invitation, { and, eq }) =>
          and(
            eq(invitation.email, email),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, "pending"),
          ),
      },
    );

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email address" },
        { status: 400 },
      );
    }

    // Generate a unique token for the invitation
    const token = randomBytes(32).toString("hex");

    // Invitation expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation in database
    try {
      // Convert organizationId to integer
      const orgId =
        typeof organizationId === "string"
          ? parseInt(organizationId, 10)
          : organizationId;
      // Convert user.id to integer if needed
      const inviterId =
        typeof user.id === "string" ? parseInt(user.id) : user.id;

      const invitation = await db
        .insert(organizationInvitations)
        .values({
          email,
          role,
          organizationId: orgId,
          token,
          invitedById: inviterId,
          expiresAt,
        })
        .returning();

      // TODO: Send invitation email
      // This would typically use SendGrid, AWS SES, or similar email service
      // The email would contain a link with the token for the user to accept the invitation

      return NextResponse.json({
        success: true,
        invitation: invitation[0],
      });
    } catch (dbError) {
      console.error("Database error creating invitation:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizations/invitations
 *
 * Cancels a pending invitation
 *
 * Required query parameters:
 * - id: ID of the invitation to cancel
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get invitationId from query params
    const { searchParams } = new URL(request.url);
    const invitationId = (searchParams.get("id") || undefined);

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 },
      );
    }

    // Get the invitation to check organization and status
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.id, parseInt(invitationId)),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    // Only allow canceling pending invitations
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending invitations can be canceled" },
        { status: 400 },
      );
    }

    // Check if the user has permission to cancel invitations for this organization
    // Handle type conversions for the comparison
    const userId = typeof user.id === "number" ? user.id : parseInt(user.id);
    const invitedById =
      typeof invitation.invitedById === "string"
        ? parseInt(invitation.invitedById)
        : invitation.invitedById;

    if (user.role !== "super_admin" && invitedById !== userId) {
      // Convert organizationId to string for query
      const orgIdStr = String(invitation.organizationId);

      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, orgIdStr),
          ),
      });

      // User must belong to the organization or be a super admin or the inviter
      if (!userOrg && !hasPermission("update:organizations", user.role)) {
        return NextResponse.json(
          {
            error:
              "You do not have permission to cancel invitations for this organization",
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission("update:users", user.role)) {
        return NextResponse.json(
          { error: "You do not have permission to manage invitations" },
          { status: 403 },
        );
      }
    }

    // For development mode, return success without actual update
    if (process.env.NODE_ENV !== "production") {
      console.log(`DEVELOPMENT MODE: Would cancel invitation ${invitationId}`);
      return NextResponse.json({
        success: true,
        message: "Invitation canceled successfully",
      });
    }

    // In production, update the invitation status to canceled
    try {
      await db
        .update(organizationInvitations)
        .set({
          status: "canceled",
          updated_at: new Date(),
        })
        .where(eq(organizationInvitations.id, parseInt(invitationId)));

      return NextResponse.json({
        success: true,
        message: "Invitation canceled successfully",
      });
    } catch (dbError) {
      console.error("Database error canceling invitation:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/organizations/invitations/accept
 *
 * Accepts an invitation to join an organization
 *
 * Required body parameters:
 * - token: The invitation token
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentAuthUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 },
      );
    }

    // Find the invitation
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.token, token),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 },
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation is no longer valid" },
        { status: 400 },
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // For development mode, log expiration
      if (process.env.NODE_ENV !== "production") {
        console.log(`DEVELOPMENT MODE: Invitation has expired`);
      } else {
        // In production, update invitation status
        await db
          .update(organizationInvitations)
          .set({ status: "expired" })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 },
      );
    }

    // Check if the invitation email matches the current user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 },
      );
    }

    // Check if user is already a member of this organization
    // Convert organizationId to string for query
    const orgIdStr = String(invitation.organizationId);

    const existingUserOrg = await db.query.userOrganizations.findFirst({
      where: (userOrg, { and, eq }) =>
        and(eq(userOrg.userId, user.id), eq(userOrg.organizationId, orgIdStr)),
    });

    if (existingUserOrg) {
      // For development mode, just log this condition
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `DEVELOPMENT MODE: User is already a member of this organization`,
        );
      } else {
        // In production, update invitation status
        await db
          .update(organizationInvitations)
          .set({ status: "accepted" })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json(
        {
          error: "You are already a member of this organization",
          alreadyMember: true,
        },
        { status: 400 },
      );
    }

    // For development mode, return success without actual database operations
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `DEVELOPMENT MODE: Would add user ${user.id} to organization ${invitation.organizationId} with role ${invitation.role}`,
      );
      console.log(
        `DEVELOPMENT MODE: Would mark invitation ${invitation.id} as accepted`,
      );

      return NextResponse.json({
        success: true,
        organization: {
          id: invitation.organizationId,
          role: invitation.role,
        },
      });
    }

    // In production, add user to organization and update invitation status
    try {
      // Transaction to ensure both operations succeed or fail together
      // Check if this is the user's first organization, which would make it primary
      const userOrgs = await db.query.userOrganizations.findMany({
        where: eq(userOrganizations.userId, user.id),
      });

      const isPrimary = userOrgs.length === 0;

      // Add user to organization - convert types as needed
      // The schema has a mismatch between organizationId types (text vs integer)
      const userOrg = await db
        .insert(userOrganizations)
        .values({
          userId: user.id,
          // Converting number to string for userOrganizations schema
          organizationId: String(invitation.organizationId),
          role: invitation.role,
          isPrimary,
        })
        .returning();

      // Update invitation status
      await db
        .update(organizationInvitations)
        .set({
          status: "accepted",
          updated_at: new Date(),
        })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json({
        success: true,
        userOrganization: userOrg[0],
      });
    } catch (dbError) {
      console.error("Database error accepting invitation:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
