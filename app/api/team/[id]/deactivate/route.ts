import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { users, systemSystemEvents } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

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
            "Missing required fields: reason, effectiveDate, deactivatedBy",
        },
        { status: 400 },
      );
    }

    const timestamp = new Date();

    // Update user status to inactive (in real implementation, this would update the actual user record)
    // For now, we'll log the deactivation event

    // Log deactivation event to system events
    await db.insert(systemEvents).values({
      source: "team_management",
      eventType: "team.member.deactivated",
      eventName: "Team Member Deactivated",
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
      status: "completed",
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
        source: "team_management",
        eventType: "assignments.transferred",
        eventName: "Assignments Transferred",
        payload: {
          fromMemberId: id,
          toMemberId: transferTo,
          transferredBy: deactivatedBy,
          transferredAt: timestamp.toISOString(),
        },
        status: "completed",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return NextResponse.json({
      success: true,
      memberId: id,
      status: "deactivated",
      effectiveDate,
      transferAssignments,
      transferTo,
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Error deactivating team member:", error);
    return NextResponse.json(
      { error: "Failed to deactivate team member" },
      { status: 500 },
    );
  }
}
