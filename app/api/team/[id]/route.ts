import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;../../../../lib/db-connection&quot;;
import { users, userOrganizations } from &quot;@shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { getServerSession } from &quot;next-auth&quot;;
// Mock auth for development
const authOptions = {};

// GET /api/team/[id] - Get team member details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;
    const [teamMember] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        location: users.location,
        bio: users.bio,
        status: users.status,
        createdAt: users.createdAt,
        role: userOrganizations.role,
      })
      .from(users)
      .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (!teamMember) {
      return NextResponse.json(
        { error: &quot;Team member not found&quot; },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error(&quot;Error fetching team member:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}

// PUT /api/team/[id] - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, location, bio, status, role, specialties } =
      body;

    // Update user details
    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        email,
        phone,
        location,
        bio,
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.id))
      .returning();

    // Update role if provided
    if (role) {
      await db
        .update(userOrganizations)
        .set({
          role,
          updatedAt: new Date(),
        })
        .where(eq(userOrganizations.userId, params.id));
    }

    // Publish event for microservices
    await fetch(&quot;/api/events/publish&quot;, {
      method: &quot;POST&quot;,
      headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
      body: JSON.stringify({
        eventType: &quot;team.member.updated&quot;,
        payload: {
          memberId: params.id,
          updatedData: body,
          updatedBy: (session.user as any).id,
          organizationId: (session.user as any).organizationId,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(&quot;Error updating team member:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}
