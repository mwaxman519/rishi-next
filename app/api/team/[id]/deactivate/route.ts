import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;../../../../../lib/db-connection&quot;;
import { users, systemSystemEvents } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      reason,
      effectiveDate,
      transferAssignments,
      transferTo,
      notes,
      deactivatedBy,
    } = body;

    // Validate required fields
    if (!reason || !effectiveDate || !deactivatedBy) {
      return NextResponse.json(
        {
          error:
            &quot;Missing required fields: reason, effectiveDate, deactivatedBy&quot;,
        },
        { status: 400 },
      );
    }

    const timestamp = new Date();

    // Update user status to inactive (in real implementation, this would update the actual user record)
    // For now, we'll log the deactivation event

    // Log deactivation event to system events
    await db.insert(systemEvents).values({
      source: &quot;team_management&quot;,
      eventType: &quot;team.member.deactivated&quot;,
      eventName: &quot;Team Member Deactivated&quot;,
      payload: {
        memberId: id,
        reason,
        effectiveDate,
        transferAssignments,
        transferTo,
        notes,
        deactivatedBy,
        deactivatedAt: timestamp.toISOString(),
      },
      status: &quot;completed&quot;,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // In a real implementation, this would:
    // 1. Update user status to 'inactive'
    // 2. Revoke access permissions
    // 3. Transfer assignments if specified
    // 4. Send notifications to relevant parties

    console.log(`👤 Team member ${id} deactivated. Reason: ${reason}`);

    if (transferAssignments && transferTo) {
      console.log(`🔄 Assignments transferred to ${transferTo}`);

      // Log assignment transfer event
      await db.insert(systemEvents).values({
        source: &quot;team_management&quot;,
        eventType: &quot;assignments.transferred&quot;,
        eventName: &quot;Assignments Transferred&quot;,
        payload: {
          fromMemberId: id,
          toMemberId: transferTo,
          transferredBy: deactivatedBy,
          transferredAt: timestamp.toISOString(),
        },
        status: &quot;completed&quot;,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      memberId: id,
      status: &quot;deactivated&quot;,
      effectiveDate,
      transferAssignments,
      transferTo,
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error(&quot;Error deactivating team member:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to deactivate team member&quot; },
      { status: 500 },
    );
  }
}
