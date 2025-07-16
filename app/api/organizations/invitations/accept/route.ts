import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth-utils";
import {
  organizationInvitations,
  userOrganizations,
  userOrganizationPreferences,
  organizations,
} from "@/shared/schema";
import { sendEmail } from "@/lib/email-utils";

/**
 * POST handler for accepting an organization invitation
 * POST /api/organizations/invitations/accept
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Find the invitation by token
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.token, token),
      with: {
        organization: true,
        invitedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 404 },
      );
    }

    // Check if the invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      // Update invitation status to 'expired'
      await db
        .update(organizationInvitations)
        .set({ status: "expired" })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Check if invitation is not pending (already accepted, rejected, expired)
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          error: `Invitation is no longer valid. Status: ${invitation.status}`,
        },
        { status: 400 },
      );
    }

    // Check if the invitation email matches the current user's email
    const userEmail = currentUser.email || "";
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 },
      );
    }

    // Check if the user is already a member of the organization
    const existingMembership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.user_id, currentUser.id),
        eq(userOrganizations.organization_id, invitation.organizationId),
      ),
    });

    if (existingMembership) {
      // Update invitation status to 'accepted'
      await db
        .update(organizationInvitations)
        .set({ status: "accepted", updated_at: new Date() })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json(
        { error: "You are already a member of this organization" },
        { status: 400 },
      );
    }

    // Determine if this should be the user's primary organization
    const isPrimary = !(await db.query.userOrganizations.findFirst({
      where: eq(userOrganizations.user_id, currentUser.id),
    }));

    // Add the user to the organization with the specified role
    await db.insert(userOrganizations).values({
      user_id: currentUser.id,
      organization_id: invitation.organizationId,
      role: invitation.role,
      is_primary: isPrimary,
    });

    // Create default user preferences for this organization
    await db.insert(userOrganizationPreferences).values({
      userId: currentUser.id,
      organizationId: invitation.organizationId,
      theme: "system",
      dashboardLayout: "default",
      notificationSettings: JSON.stringify({
        email: true,
        inApp: true,
        push: false,
      }),
    });

    // Update invitation status to 'accepted'
    await db
      .update(organizationInvitations)
      .set({ status: "accepted", updated_at: new Date() })
      .where(eq(organizationInvitations.id, invitation.id));

    // Send notification email to the inviter
    if (invitation.invitedBy) {
      try {
        await sendEmail({
          to: invitation.invitedBy.email,
          subject: `A user has joined ${invitation.organization.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your invitation was accepted</h2>
              <p>A user has accepted your invitation to join ${invitation.organization.name}.</p>
              <p>They are now a member of your organization with the role of "${invitation.role}".</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Continue with the process even if email sending fails
      }
    }

    return NextResponse.json(
      {
        message: "You have successfully joined the organization",
        organization: {
          id: invitation.organizationId,
          name: invitation.organization.name,
          role: invitation.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}

/**
 * GET handler for retrieving invitation details
 * GET /api/organizations/invitations/accept?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = ((searchParams.get("token") || undefined) || undefined);

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the invitation by token
    const invitation = await db.query.organizationInvitations.findFirst({
      where: eq(organizationInvitations.token, token),
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            type: true,
            tier: true,
            logo_url: true,
          },
        },
        invitedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 404 },
      );
    }

    // Check if the invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      // Update invitation status to 'expired' if it's still pending
      if (invitation.status === "pending") {
        await db
          .update(organizationInvitations)
          .set({ status: "expired" })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json({
        invitation: {
          ...invitation,
          valid: false,
          reason: "expired",
        },
      });
    }

    // Check if invitation is not pending (already accepted, rejected)
    if (invitation.status !== "pending") {
      return NextResponse.json({
        invitation: {
          ...invitation,
          valid: false,
          reason: invitation.status,
        },
      });
    }

    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    let emailMatch = false;

    if (currentUser) {
      const userEmail = currentUser.email || "";
      emailMatch = invitation.email.toLowerCase() === userEmail.toLowerCase();

      // Check if user is already a member
      if (emailMatch) {
        const existingMembership = await db.query.userOrganizations.findFirst({
          where: and(
            eq(userOrganizations.user_id, currentUser.id),
            eq(userOrganizations.organization_id, invitation.organizationId),
          ),
        });

        if (existingMembership) {
          return NextResponse.json({
            invitation: {
              ...invitation,
              valid: false,
              reason: "already_member",
              userAuthenticated: true,
            },
          });
        }
      }
    }

    // Return invitation details
    return NextResponse.json({
      invitation: {
        ...invitation,
        valid: true,
        emailMatch,
        userAuthenticated: !!currentUser,
      },
    });
  } catch (error) {
    console.error("Error retrieving invitation:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invitation" },
      { status: 500 },
    );
  }
}
