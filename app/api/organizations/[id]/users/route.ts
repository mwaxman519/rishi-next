import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Organization Users API
 *
 * This endpoint retrieves all users for a specific organization.
 * The users are filtered by the organization ID in the URL.
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  organizations,
  users,
  organizationUsers,
} from &quot;@/shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const organizationId = parseInt(params.id, 10);
    if (isNaN(organizationId)) {
      return NextResponse.json(
        { error: &quot;Invalid organization ID&quot; },
        { status: 400 },
      );
    }

    // Removed mock data - using only real database queries

    // Check if the user has access to this organization
    const userOrg = await db.query.organizations.findFirst({
      where: (orgs, { and, eq }) => and(eq(orgs.id, organizationId)),
      with: {
        organizationUsers: {
          where: (ou) => eq(ou.user_id, user.id),
        },
      },
    });

    if (!userOrg || userOrg.organizationUsers.length === 0) {
      return NextResponse.json(
        { error: &quot;Access denied to this organization&quot; },
        { status: 403 },
      );
    }

    // Fetch users for this organization
    const organizationUsersWithDetails = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: organizationUsers.role,
      })
      .from(organizationUsers)
      .innerJoin(users, eq(organizationUsers.user_id, users.id))
      .where(eq(organizationUsers.organization_id, organizationId));

    return NextResponse.json({
      users: organizationUsersWithDetails,
    });
  } catch (error) {
    console.error(&quot;Error fetching organization users:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch organization users&quot; },
      { status: 500 },
    );
  }
}
