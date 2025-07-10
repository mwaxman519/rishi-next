import { NextRequest, NextResponse } from "next/server";
import { bookingsEventsService } from "../../../../services/bookings-events-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { z } from "zod";

// Validation schema for approval
const approvalSchema = z.object({
  generateEvents: z.boolean().default(true),
});

/**
 * Approve a booking
 * This will change the booking status to approved and optionally generate event instances
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
    if (!session.user.permissions?.includes("approve:bookings")) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const { id: bookingId } = await params;
    const data = await request.json();

    // Validate input
    const validatedData = approvalSchema.parse(data);

    // Approve the booking
    const updatedBooking = await bookingsEventsService.approveBooking(
      bookingId,
      session.user.id,
      validatedData.generateEvents,
    );

    return NextResponse.json({
      success: true,
      message: "Booking approved successfully",
      booking: updatedBooking,
      eventsGenerated: validatedData.generateEvents,
    });
  } catch (error: any) {
    console.error("Error approving booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve booking" },
      { status: 500 },
    );
  }
}
