import { generateStaticParams } from "./generateStaticParams";

export const dynamic = "force-static";
export const revalidate = false;


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { bookings } from "@/shared/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { z } from "zod";
import { eventBus } from "../../../../events/event-bus";

// Validation schema for rejection
const rejectionSchema = z.object({
  reason: z.string().min(1, "A reason for rejection is required"),
});

/**
 * Reject a booking
 * This will change the booking status to rejected and notify the client
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
    const validatedData = rejectionSchema.parse(data);

    // Get the booking to verify it exists and get client ID
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if the booking is already rejected
    if (existingBooking.status === "rejected") {
      return NextResponse.json(
        { error: "Booking is already rejected" },
        { status: 400 },
      );
    }

    // Check if the booking is already approved
    if (existingBooking.status === "approved") {
      return NextResponse.json(
        { error: "Cannot reject an approved booking" },
        { status: 400 },
      );
    }

    // Update booking status to rejected
    const updateResult = await db
      .update(bookings)
      .set({
        status: "rejected",
        rejectedById: (session.user as any).id,
        rejectedAt: new Date(),
        rejectionReason: validatedData.reason,
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

    // Publish event
    await eventBus.publish("BOOKING_REJECTED", {
      bookingId: updatedBooking.id,
      clientId: updatedBooking.clientOrganizationId,
      rejectedBy: (session.user as any).id,
      rejectedAt: new Date().toISOString(),
      reason: validatedData.reason,
      allowResubmission: true,
    });

    return NextResponse.json(
      { success: true, message: "Booking rejected successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error rejecting booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject booking" },
      { status: 500 },
    );
  }
}
