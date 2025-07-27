import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth-utils";
import { organizationInvitations } from "../../../../../shared/schema";
import { sendEmail } from "../../../../lib/email-utils";

/**
 * POST handler for rejecting an organization invitation
 * POST /api/organizations/invitations/reject
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, reason } = body;

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
        organization: {
          columns: {
            id: true,
            name: true,
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

    // Check if invitation is already handled (accepted, rejected, expired)
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is already ${invitation.status}` },
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

    // Update invitation status to 'rejected'
    await db
      .update(organizationInvitations)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(organizationInvitations.id, invitation.id));

    // Send notification email to the inviter
    if (invitation.invitedBy) {
      try {
        await sendEmail({
          to: invitation.invitedBy.email,
          subject: `A user has declined your invitation to ${invitation.organization.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Invitation Declined</h2>
              <p>A user has declined your invitation to join ${invitation.organization.name}.</p>
              ${reason ? `<p><strong>Reason:</strong> "${reason}"</p>` : ""}
              <p>They will not be added to your organization.</p>
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
        message: "Invitation rejected successfully",
        organization: {
          id: invitation.organizationId,
          name: invitation.organization.name,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    return NextResponse.json(
      { error: "Failed to reject invitation" },
      { status: 500 },
    );
  }
}
