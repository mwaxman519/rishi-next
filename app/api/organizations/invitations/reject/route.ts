import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { eq } from &quot;drizzle-orm&quot;;
import { db } from &quot;@/lib/db&quot;;
import { getCurrentUser } from &quot;@/lib/auth-utils&quot;;
import { organizationInvitations } from &quot;@/shared/schema&quot;;
import { sendEmail } from &quot;@/lib/email-utils&quot;;

/**
 * POST handler for rejecting an organization invitation
 * POST /api/organizations/invitations/reject
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, reason } = body;

    if (!token) {
      return NextResponse.json({ error: &quot;Token is required&quot; }, { status: 400 });
    }

    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: &quot;Authentication required&quot; },
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
        { error: &quot;Invalid or expired invitation token&quot; },
        { status: 404 },
      );
    }

    // Check if the invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      // Update invitation status to 'expired'
      await db
        .update(organizationInvitations)
        .set({ status: &quot;expired&quot; })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json(
        { error: &quot;Invitation has expired&quot; },
        { status: 400 },
      );
    }

    // Check if invitation is already handled (accepted, rejected, expired)
    if (invitation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        { error: `Invitation is already ${invitation.status}` },
        { status: 400 },
      );
    }

    // Check if the invitation email matches the current user's email
    const userEmail = currentUser.email || "&quot;;
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: &quot;This invitation was sent to a different email address&quot; },
        { status: 403 },
      );
    }

    // Update invitation status to 'rejected'
    await db
      .update(organizationInvitations)
      .set({
        status: &quot;rejected&quot;,
        updated_at: new Date(),
      })
      .where(eq(organizationInvitations.id, invitation.id));

    // Send notification email to the inviter
    if (invitation.invitedBy) {
      try {
        await sendEmail({
          to: invitation.invitedBy.email,
          subject: `A user has declined your invitation to ${invitation.organization.name}`,
          html: `
            <div style=&quot;font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;&quot;>
              <h2>Invitation Declined</h2>
              <p>A user has declined your invitation to join ${invitation.organization.name}.</p>
              ${reason ? `<p><strong>Reason:</strong> &quot;${reason}&quot;</p>` : &quot;&quot;}
              <p>They will not be added to your organization.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(&quot;Failed to send notification email:&quot;, emailError);
        // Continue with the process even if email sending fails
      }
    }

    return NextResponse.json(
      {
        message: &quot;Invitation rejected successfully&quot;,
        organization: {
          id: invitation.organizationId,
          name: invitation.organization.name,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error rejecting invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to reject invitation" },
      { status: 500 },
    );
  }
}
