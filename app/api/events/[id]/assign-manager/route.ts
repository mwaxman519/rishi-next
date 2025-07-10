import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "../../../../services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { z } from "zod";

// Validation schema for manager assignment
const managerAssignmentSchema = z.object({
  managerId: z.string().uuid("Invalid manager ID format"),
});

/**
 * Assign a field manager to an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify permissions
    if (!session.user.permissions?.includes("assign:managers")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const eventId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = managerAssignmentSchema.parse(data);

    // Assign manager to the event
    const updatedEvent = await bookingsEventsService.assignEventToManager(
      eventId,
      validatedData.managerId,
      session.user.id,
    );

    return NextResponse.json({
      success: true,
      message: "Manager assigned to event successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error assigning manager to event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign manager to event" },
      { status: 500 },
    );
  }
}
