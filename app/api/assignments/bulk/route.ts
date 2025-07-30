import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;../../../lib/db-connection&quot;;
import { brandAgentAssignments } from &quot;@shared/schema&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { randomUUID } from &quot;crypto&quot;;

// POST /api/assignments/bulk - Create bulk assignments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();
    const { assignments } = body;

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: &quot;Assignments array is required&quot; },
        { status: 400 },
      );
    }

    // Create assignments in database
    const assignmentRecords = assignments.map((assignment: any) => ({
      id: randomUUID(),
      brandAgentId: assignment.memberId,
      bookingId: assignment.bookingId,
      activityId: assignment.activityId,
      status: assignment.status || &quot;assigned&quot;,
      assignedAt: new Date(assignment.assignedAt || Date.now()),
      assignedById: assignment.assignedById || (session.user as any).id,
    }));

    const createdAssignments = await db
      .insert(brandAgentAssignments)
      .values(assignmentRecords)
      .returning();

    // Publish events for each assignment
    for (const assignment of createdAssignments) {
      await fetch(&quot;/api/events/publish&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({
          eventType: &quot;assignment.created&quot;,
          payload: {
            assignmentId: assignment.id,
            memberId: assignment.brandAgentId,
            bookingId: assignment.bookingId,
            assignedBy: assignment.assignedById,
            organizationId: (session.user as any).organizationId,
          },
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({
      success: true,
      data: createdAssignments,
      count: createdAssignments.length,
    });
  } catch (error) {
    console.error(&quot;Error creating bulk assignments:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to create assignments&quot; },
      { status: 500 },
    );
  }
}
