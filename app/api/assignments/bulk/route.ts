import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { brandAgentAssignments } from "@shared/schema";
import { getServerSession } from "next-auth";
// Mock auth for development
const authOptions = {};

// POST /api/assignments/bulk - Create bulk assignments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignments } = body;

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Assignments array is required" },
        { status: 400 },
      );
    }

    // Create assignments in database
    const assignmentRecords = assignments.map((assignment: any) => ({
      id: crypto.randomUUID(),
      brandAgentId: assignment.memberId,
      eventId: assignment.eventId,
      status: assignment.status || "assigned",
      assignedAt: new Date(assignment.assignedAt || Date.now()),
      assignedBy: assignment.assignedBy || (session.user as any).id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const createdAssignments = await db
      .insert(brandAgentAssignments)
      .values(assignmentRecords)
      .returning();

    // Publish events for each assignment
    for (const assignment of createdAssignments) {
      await fetch("/api/events/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "assignment.created",
          payload: {
            assignmentId: assignment.id,
            memberId: assignment.brandAgentId,
            eventId: assignment.eventId,
            assignedBy: assignment.assignedBy,
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
    console.error("Error creating bulk assignments:", error);
    return NextResponse.json(
      { error: "Failed to create assignments" },
      { status: 500 },
    );
  }
}
