import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;



import { NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { activities } from &quot;@/shared/schema&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-server&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { USER_ROLES } from &quot;@/shared/schema&quot;;

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has rejection permissions
    const canReject = [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.INTERNAL_ADMIN,
      USER_ROLES.INTERNAL_FIELD_MANAGER,
    ].includes((session.user as any).role);

    if (!canReject) {
      return NextResponse.json({ error: &quot;Permission denied&quot; }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Get the current activity state
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));

    if (!activity) {
      return NextResponse.json(
        { error: &quot;Activity not found&quot; },
        { status: 404 },
      );
    }

    // Check if the activity is in a state that can be rejected
    const rejectableStates = [&quot;draft&quot;, &quot;pending&quot;];

    if (!rejectableStates.includes(activity.status)) {
      return NextResponse.json(
        {
          error: &quot;Cannot reject this activity&quot;,
          message: `Activity status is ${activity.status}, must be one of: ${rejectableStates.join(&quot;, &quot;)}`,
        },
        { status: 400 },
      );
    }

    // Update activity status to rejected
    const [updatedActivity] = await db
      .update(activities)
      .set({
        status: &quot;rejected&quot;,
        notes: reason
          ? `${activity.notes || "&quot;}\n\nRejection reason: ${reason}`.trim()
          : activity.notes,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    // In a real app, you would likely:
    // 1. Send notifications to relevant parties
    // 2. Log the rejection action in an audit log

    return NextResponse.json({
      message: &quot;Activity rejected successfully&quot;,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error(&quot;Error rejecting activity:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to reject activity" },
      { status: 500 },
    );
  }
}
