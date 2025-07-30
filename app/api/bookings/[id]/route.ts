import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Individual Booking API
 * Handles single booking operations - get, update, delete
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  bookings,
  activities,
  BOOKING_STATUS,
  insertBookingSchema,
} from &quot;@shared/schema&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { z } from &quot;zod&quot;;

// Define a schema for booking updates
const updateBookingSchema = insertBookingSchema
  .partial();

/**
 * GET /api/bookings/[id]
 * Retrieves a single booking by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Base query conditions
    const conditions = [eq(bookings.id, bookingId)];

    // Add conditions based on user role
    const isAdmin = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
    ].includes((session.user as any).role);

    // Only allow users to see bookings from their organization if they&apos;re not an admin
    if (!isAdmin && (session.user as any).organizationId) {
      conditions.push(
        eq(bookings.clientOrganizationId, (session.user as any).organizationId),
      );
    }

    // Get the booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    if (!booking) {
      return NextResponse.json({ error: &quot;Booking not found&quot; }, { status: 404 });
    }

    // Get related activities for this booking
    const relatedActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.bookingId, bookingId));

    return NextResponse.json({
      ...booking,
      activities: relatedActivities,
    });
  } catch (error) {
    console.error(&quot;Error fetching booking:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch booking&quot; },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/bookings/[id]
 * Updates a booking
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const data = await req.json();

    // Validate request data
    const validatedData = updateBookingSchema.parse(data);

    // Check if booking exists and user has permission to update it
    const conditions = [eq(bookings.id, bookingId)];

    // Add conditions based on user role
    const isAdmin = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
    ].includes((session.user as any).role);

    // Only allow users to update bookings from their organization if they&apos;re not an admin
    if (!isAdmin && (session.user as any).organizationId) {
      conditions.push(
        eq(bookings.clientOrganizationId, (session.user as any).organizationId),
      );
    }

    // Get the booking first to check permissions and current status
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    if (!existingBooking) {
      return NextResponse.json(
        {
          error: &quot;Booking not found or you don&apos;t have permission to update it&quot;,
        },
        { status: 404 },
      );
    }

    // Only allow editing if the booking is in DRAFT or PENDING status
    // Admins can edit any booking, but regular users can only edit drafts
    const canEdit =
      isAdmin ||
      (existingBooking.status === BOOKING_STATUS.DRAFT &&
        existingBooking.createdById === (session.user as any).id);

    if (!canEdit) {
      return NextResponse.json(
        { error: &quot;Cannot edit booking in its current status&quot; },
        { status: 403 },
      );
    }

    // Update the booking
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error(&quot;Error updating booking:&quot;, error);
    return NextResponse.json(
      { error: error.message || &quot;Failed to update booking&quot; },
      { status: 400 },
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Deletes a booking (only if it&apos;s a draft)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Check if booking exists and user has permission to delete it
    const conditions = [eq(bookings.id, bookingId)];

    // Only allow users to delete bookings from their organization
    const isAdmin = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
    ].includes((session.user as any).role);

    if (!isAdmin && (session.user as any).organizationId) {
      conditions.push(
        eq(bookings.clientOrganizationId, (session.user as any).organizationId),
      );
    }

    // Get the booking first to check permissions and current status
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    if (!existingBooking) {
      return NextResponse.json(
        {
          error: &quot;Booking not found or you don&apos;t have permission to delete it&quot;,
        },
        { status: 404 },
      );
    }

    // Only allow deletion if the booking is in DRAFT status
    // Or allow admin to delete any booking not in COMPLETED status
    const canDelete = isAdmin
      ? existingBooking.status !== BOOKING_STATUS.COMPLETED
      : existingBooking.status === BOOKING_STATUS.DRAFT &&
        existingBooking.createdById === (session.user as any).id;

    if (!canDelete) {
      return NextResponse.json(
        { error: &quot;Cannot delete booking in its current status&quot; },
        { status: 403 },
      );
    }

    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return NextResponse.json(
      { message: &quot;Booking deleted successfully&quot; },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Error deleting booking:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to delete booking&quot; },
      { status: 500 },
    );
  }
}
