import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { eq, and } from &quot;drizzle-orm&quot;;
import { db } from &quot;@/lib/db&quot;;
import { getCurrentUser } from &quot;@/lib/auth-utils&quot;;
import {
  organizationInvitations,
  userOrganizations,
  userOrganizationPreferences,
  organizations,
} from &quot;@/shared/schema&quot;;
import { sendEmail } from &quot;@/lib/email-utils&quot;;

/**
 * POST handler for accepting an organization invitation
 * POST /api/organizations/invitations/accept
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

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

    // Check if invitation is not pending (already accepted, rejected, expired)
    if (invitation.status !== &quot;pending&quot;) {
      return NextResponse.json(
        {
          error: `Invitation is no longer valid. Status: ${invitation.status}`,
        },
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
        .set({ status: &quot;accepted&quot;, updated_at: new Date() })
        .where(eq(organizationInvitations.id, invitation.id));

      return NextResponse.json(
        { error: &quot;You are already a member of this organization&quot; },
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
      theme: &quot;system&quot;,
      dashboardLayout: &quot;default&quot;,
      notificationSettings: JSON.stringify({
        email: true,
        inApp: true,
        push: false,
      }),
    });

    // Update invitation status to 'accepted'
    await db
      .update(organizationInvitations)
      .set({ status: &quot;accepted&quot;, updated_at: new Date() })
      .where(eq(organizationInvitations.id, invitation.id));

    // Send notification email to the inviter
    if (invitation.invitedBy) {
      try {
        await sendEmail({
          to: invitation.invitedBy.email,
          subject: `A user has joined ${invitation.organization.name}`,
          html: `
            <div style=&quot;font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;&quot;>
              <h2>Your invitation was accepted</h2>
              <p>A user has accepted your invitation to join ${invitation.organization.name}.</p>
              <p>They are now a member of your organization with the role of &quot;${invitation.role}&quot;.</p>
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
        message: &quot;You have successfully joined the organization&quot;,
        organization: {
          id: invitation.organizationId,
          name: invitation.organization.name,
          role: invitation.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error accepting invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to accept invitation&quot; },
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
    const token = (searchParams.get(&quot;token&quot;) || undefined);

    if (!token) {
      return NextResponse.json({ error: &quot;Token is required&quot; }, { status: 400 });
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
        { error: &quot;Invalid or expired invitation token&quot; },
        { status: 404 },
      );
    }

    // Check if the invitation has expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      // Update invitation status to 'expired' if it&apos;s still pending
      if (invitation.status === &quot;pending&quot;) {
        await db
          .update(organizationInvitations)
          .set({ status: &quot;expired&quot; })
          .where(eq(organizationInvitations.id, invitation.id));
      }

      return NextResponse.json({
        invitation: {
          ...invitation,
          valid: false,
          reason: &quot;expired&quot;,
        },
      });
    }

    // Check if invitation is not pending (already accepted, rejected)
    if (invitation.status !== &quot;pending&quot;) {
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
      const userEmail = currentUser.email || &quot;&quot;;
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
              reason: &quot;already_member&quot;,
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
    console.error(&quot;Error retrieving invitation:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to retrieve invitation" },
      { status: 500 },
    );
  }
}
