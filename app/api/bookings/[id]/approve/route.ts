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

    // Verify permissions using proper authentication check
    if (!session.user || !(session.user as any).role) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }
    
    const userRole = (session.user as any).role;
    const allowedRoles = ['super_admin', 'internal_admin', 'internal_field_manager'];
    
    if (!allowedRoles.includes(userRole)) {
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
    const updateResult = await db
      .update(bookings)
      .set({
        status: "approved",
        approvedById: (session.user as any).id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    const updatedBooking = updateResult[0];
    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

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
