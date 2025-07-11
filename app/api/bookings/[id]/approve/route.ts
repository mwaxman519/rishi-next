import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { bookings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";

// Validation schema for approval
const approvalSchema = z.object({
  notes: z.string().optional(),
});

/**
 * Approve a booking
 * This will change the booking status to approved
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

    // Approve the booking by updating its status
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: "approved",
        approvedById: session.user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Booking approved successfully",
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error approving booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve booking" },
      { status: 500 },
    );
  }
}
