/**
 * Individual Booking API
 * Handles single booking operations - get, update, delete
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  bookings,
  activities,
  BOOKING_STATUS,
  insertBookingSchema,
} from "../../../shared/schema";
import { getServerSession } from "next-auth";
import { eq, and } from "drizzle-orm";
import { authOptions } from "../../../lib/auth-options";
import { z } from "zod";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Base query conditions
    const conditions = [eq(bookings.id, bookingId)];

    // Add conditions based on user role
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
    ].includes((session.user as any).role);

    // Only allow users to see bookings from their organization if they're not an admin
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
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const data = await req.json();

    // Validate request data
    const validatedData = updateBookingSchema.parse(data);

    // Check if booking exists and user has permission to update it
    const conditions = [eq(bookings.id, bookingId)];

    // Add conditions based on user role
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
    ].includes((session.user as any).role);

    // Only allow users to update bookings from their organization if they're not an admin
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
          error: "Booking not found or you don't have permission to update it",
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
        { error: "Cannot edit booking in its current status" },
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
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 400 },
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Deletes a booking (only if it's a draft)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Check if booking exists and user has permission to delete it
    const conditions = [eq(bookings.id, bookingId)];

    // Only allow users to delete bookings from their organization
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
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
          error: "Booking not found or you don't have permission to delete it",
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
        { error: "Cannot delete booking in its current status" },
        { status: 403 },
      );
    }

    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return NextResponse.json(
      { message: "Booking deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
