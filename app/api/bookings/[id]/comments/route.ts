/**
 * Booking Comments API
 * Handles adding and retrieving comments for bookings
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import {
  bookings,
  bookingComments,
  insertBookingCommentSchema,
} from "../../../../../shared/schema";
import { getAuthSession } from "../../../../lib/session";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/bookings/[id]/comments
 * Retrieves comments for a specific booking
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the booking to check permissions
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
    ].includes(session.user.role);
    const isInClientOrg =
      booking.clientOrganizationId === session.user.organizationId;

    if (!isAdmin && !isInClientOrg) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Query to get comments
    let query = db
      .select()
      .from(bookingComments)
      .where(eq(bookingComments.bookingId, id))
      .orderBy(desc(bookingComments.createdAt));

    // If not admin, filter out internal comments
    if (!isAdmin) {
      query = query.where(eq(bookingComments.isInternal, false));
    }

    const comments = await query;

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching booking comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bookings/[id]/comments
 * Adds a new comment to a booking
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Get the booking to check permissions
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check permissions
    const isAdmin = [
      "super_admin",
      "internal_admin",
      "internal_field_manager",
    ].includes(session.user.role);
    const isInClientOrg =
      booking.clientOrganizationId === session.user.organizationId;

    if (!isAdmin && !isInClientOrg) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Non-admins can't create internal comments
    if (!isAdmin && data.isInternal) {
      return NextResponse.json(
        {
          error: "Only administrators can create internal comments",
        },
        { status: 403 },
      );
    }

    // Validate the comment data
    const commentData = insertBookingCommentSchema.parse({
      bookingId: id,
      userId: session.user.id,
      comment: data.comment,
      isInternal: isAdmin ? data.isInternal || false : false,
    });

    // Create the comment
    const [newComment] = await db
      .insert(bookingComments)
      .values(commentData)
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating booking comment:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.format(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
