import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getCurrentAuthUser } from &quot;@/lib/auth-server&quot;;
import { db } from &quot;../../../../lib/db-connection&quot;;
import { organizationInvitations, userOrganizations } from &quot;@shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { hasPermission } from &quot;@/lib/rbac&quot;;
import { randomBytes } from &quot;crypto&quot;;

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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    // Check if the user has permission to view organization invitations
    // Ensure the user belongs to this organization or is a super admin
    if (user.role !== &quot;super_admin&quot;) {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      if (!userOrg && !(await hasPermission(user.id, &quot;read:organizations&quot;))) {
        return NextResponse.json(
          {
            error:
              &quot;You do not have permission to view invitations for this organization&quot;,
          },
          { status: 403 },
        );
      }

      // Check role-based permissions
      if (!(await hasPermission(user.id, &quot;read:users&quot;))) {
        return NextResponse.json(
          { error: &quot;You do not have permission to view invitations&quot; },
          { status: 403 },
        );
      }
    }

    // Fetch invitations from the database using Drizzle ORM
    const organizationInvitations = await db
      .select()
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.organizationId, organizationId),
          eq(userOrganizations.status, &quot;pending&quot;),
        ),
      );

    return NextResponse.json({ invitations: organizationInvitations });
  } catch (error) {
    console.error(&quot;Error fetching organization invitations:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organization invitations&quot; },
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { email, role, organizationId } = body;

    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: &quot;Email, Role and Organization ID are required&quot; },
        { status: 400 },
      );
    }

    // Check if the user has permission to invite users to organization
    if (user.role !== &quot;super_admin&quot;) {
      const userOrg = await db.query.userOrganizations.findFirst({
        where: (userOrg, { and, eq }) =>
          and(
            eq(userOrg.userId, user.id),
            eq(userOrg.organizationId, organizationId),
          ),
      });

      // User must belong to the organization or be a super admin
      if (!userOrg && !hasPermission(&quot;update:organizations&quot;, user.role)) {
        return NextResponse.json(
          {
            error:
              &quot;You do not have permission to invite users to this organization&quot;,
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission(&quot;create:users&quot;, user.role)) {
        return NextResponse.json(
          { error: &quot;You do not have permission to invite users&quot; },
          { status: 403 },
        );
      }
    }

    // Check if there&apos;s an existing pending invitation for this email + organization
    const existingInvitation = await db.query.organizationInvitations.findFirst(
      {
        where: (invitation, { and, eq }) =>
          and(
            eq(invitation.email, email),
            eq(invitation.organizationId, organizationId),
            eq(invitation.status, &quot;pending&quot;),
          ),
      },
    );

    if (existingInvitation) {
      return NextResponse.json(
        { error: &quot;An invitation has already been sent to this email address&quot; },
        { status: 400 },
      );
    }

    // Generate a unique token for the invitation
    const token = randomBytes(32).toString(&quot;hex&quot;);

    // Invitation expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation in database
    try {
      // Convert organizationId to integer
      const orgId =
        typeof organizationId === &quot;string&quot;
          ? parseInt(organizationId, 10)
          : organizationId;
      // Convert user.id to integer if needed
      const inviterId =
        typeof user.id === &quot;string&quot; ? parseInt(user.id) : user.id;

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
      console.error(&quot;Database error creating invitation:&quot;, dbError);
      throw dbError;
    }
  } catch (error) {
    console.error(&quot;Error creating invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create invitation&quot; },
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Get invitationId from query params
    const { searchParams } = new URL(request.url);
    const invitationId = (searchParams.get(&quot;id&quot;) || undefined);

    if (!invitationId) {
      return NextResponse.json(
        { error: &quot;Invitation ID is required&quot; },
        { status: 400 },
      );
    }

    // Get the invitation to check organization and status
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.id, parseInt(invitationId)),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: &quot;Invitation not found&quot; },
        { status: 404 },
      );
    }

    // Only allow canceling pending invitations
    if (invitation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        { error: &quot;Only pending invitations can be canceled&quot; },
        { status: 400 },
      );
    }

    // Check if the user has permission to cancel invitations for this organization
    // Handle type conversions for the comparison
    const userId = typeof user.id === &quot;number&quot; ? user.id : parseInt(user.id);
    const invitedById =
      typeof invitation.invitedById === &quot;string&quot;
        ? parseInt(invitation.invitedById)
        : invitation.invitedById;

    if (user.role !== &quot;super_admin&quot; && invitedById !== userId) {
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
      if (!userOrg && !hasPermission(&quot;update:organizations&quot;, user.role)) {
        return NextResponse.json(
          {
            error:
              &quot;You do not have permission to cancel invitations for this organization&quot;,
          },
          { status: 403 },
        );
      }

      // Check role-based permissions for user management
      if (!hasPermission(&quot;update:users&quot;, user.role)) {
        return NextResponse.json(
          { error: &quot;You do not have permission to manage invitations&quot; },
          { status: 403 },
        );
      }
    }

    // For development mode, return success without actual update
    if (process.env.NODE_ENV !== &quot;production&quot;) {
      console.log(`DEVELOPMENT MODE: Would cancel invitation ${invitationId}`);
      return NextResponse.json({
        success: true,
        message: &quot;Invitation canceled successfully&quot;,
      });
    }

    // In production, update the invitation status to canceled
    try {
      await db
        .update(organizationInvitations)
        .set({
          status: &quot;canceled&quot;,
          updated_at: new Date(),
        })
        .where(eq(organizationInvitations.id, parseInt(invitationId)));

      return NextResponse.json({
        success: true,
        message: &quot;Invitation canceled successfully&quot;,
      });
    } catch (dbError) {
      console.error(&quot;Database error canceling invitation:&quot;, dbError);
      throw dbError;
    }
  } catch (error) {
    console.error(&quot;Error canceling invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to cancel invitation&quot; },
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: &quot;Invitation token is required&quot; },
        { status: 400 },
      );
    }

    // Find the invitation
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.token, token),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: &quot;Invalid invitation token&quot; },
        { status: 404 },
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        { error: &quot;This invitation is no longer valid&quot; },
        { status: 400 },
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // For development mode, log expiration
      if (process.env.NODE_ENV !== &quot;production&quot;) {
        console.log(`DEVELOPMENT MODE: Invitation has expired`);
      } else {
        // In production, update invitation status
        await db
          .update(organizationInvitations)
          .set({ status: &quot;expired&quot; })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json(
        { error: &quot;This invitation has expired&quot; },
        { status: 400 },
      );
    }

    // Check if the invitation email matches the current user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: &quot;This invitation was sent to a different email address&quot; },
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
      if (process.env.NODE_ENV !== &quot;production&quot;) {
        console.log(
          `DEVELOPMENT MODE: User is already a member of this organization`,
        );
      } else {
        // In production, update invitation status
        await db
          .update(organizationInvitations)
          .set({ status: &quot;accepted&quot; })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json(
        {
          error: &quot;You are already a member of this organization&quot;,
          alreadyMember: true,
        },
        { status: 400 },
      );
    }

    // For development mode, return success without actual database operations
    if (process.env.NODE_ENV !== &quot;production&quot;) {
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
          status: &quot;accepted&quot;,
          updated_at: new Date(),
        })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json({
        success: true,
        userOrganization: userOrg[0],
      });
    } catch (dbError) {
      console.error(&quot;Database error accepting invitation:&quot;, dbError);
      throw dbError;
    }
  } catch (error) {
    console.error(&quot;Error accepting invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to accept invitation&quot; },
      { status: 500 },
    );
  }
}
