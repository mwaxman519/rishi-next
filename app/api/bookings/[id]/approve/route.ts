import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { bookings } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { z } from &quot;zod&quot;;

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
    const validatedData = approvalSchema.parse(data);

    // Approve the booking by updating its status
    const updateResult = await db
      .update(bookings)
      .set({
        status: &quot;approved&quot;,
        approvedById: (session.user as any).id,
        approvedAt: new Date(),
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

    return NextResponse.json({
      success: true,
      message: &quot;Booking approved successfully&quot;,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error(&quot;Error approving booking:&quot;, error);
    return NextResponse.json(
      { error: error.message || &quot;Failed to approve booking&quot; },
      { status: 500 },
    );
  }
}
