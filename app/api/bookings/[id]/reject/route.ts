import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { bookings } from &quot;@/shared/schema&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { z } from &quot;zod&quot;;
import { eventBus } from &quot;../../../../events/event-bus&quot;;

// Validation schema for rejection
const rejectionSchema = z.object({
  reason: z.string().min(1, &quot;A reason for rejection is required&quot;),
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Verify permissions using proper authentication check
    if (!session.user || !(session.user as any).role) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }
    
    const userRole = (session.user as any).role;
    const allowedRoles = ['super_admin', 'internal_admin', 'internal_field_manager'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
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
      return NextResponse.json({ error: &quot;Booking not found&quot; }, { status: 404 });
    }

    // Check if the booking is already rejected
    if (existingBooking.status === &quot;rejected&quot;) {
      return NextResponse.json(
        { error: &quot;Booking is already rejected&quot; },
        { status: 400 },
      );
    }

    // Check if the booking is already approved
    if (existingBooking.status === &quot;approved&quot;) {
      return NextResponse.json(
        { error: &quot;Cannot reject an approved booking&quot; },
        { status: 400 },
      );
    }

    // Update booking status to rejected
    const updateResult = await db
      .update(bookings)
      .set({
        status: &quot;rejected&quot;,
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
        { error: &quot;Failed to update booking&quot; },
        { status: 500 }
      );
    }

    // Publish event
    await eventBus.publish(&quot;BOOKING_REJECTED&quot;, {
      bookingId: updatedBooking.id,
      clientId: updatedBooking.clientOrganizationId,
      rejectedBy: (session.user as any).id,
      rejectedAt: new Date().toISOString(),
      reason: validatedData.reason,
      allowResubmission: true,
    });

    return NextResponse.json(
      { success: true, message: &quot;Booking rejected successfully&quot; },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(&quot;Error rejecting booking:&quot;, error);
    return NextResponse.json(
      { error: error.message || &quot;Failed to reject booking&quot; },
      { status: 500 },
    );
  }
}
