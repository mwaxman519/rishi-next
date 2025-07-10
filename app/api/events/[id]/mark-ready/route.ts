import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "../../../../services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { z } from "zod";

// Validation schema for ready status
const readyStatusSchema = z.object({
  staffAssigned: z.boolean(),
  kitsAssigned: z.boolean(),
  logisticsConfirmed: z.boolean(),
  venueConfirmed: z.boolean(),
});

/**
 * Mark an event as ready
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
    if (!session.user.permissions?.includes("manage:events")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const eventId = params.id;
    const data = await request.json();

    // Validate input
    const validatedData = readyStatusSchema.parse(data);

    // Check if all required items are confirmed
    const allReady =
      validatedData.staffAssigned &&
      validatedData.kitsAssigned &&
      validatedData.logisticsConfirmed &&
      validatedData.venueConfirmed;

    if (!allReady) {
      return NextResponse.json(
        {
          error:
            "All required items must be confirmed before marking the event as ready",
        },
        { status: 400 },
      );
    }

    // Mark event as ready
    const updatedEvent = await bookingsEventsService.markEventReady(
      eventId,
      session.user.id,
      validatedData,
    );

    return NextResponse.json({
      success: true,
      message: "Event marked as ready successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error marking event as ready:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark event as ready" },
      { status: 500 },
    );
  }
}
