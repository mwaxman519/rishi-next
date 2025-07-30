import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Booking Comments API
 * Handles adding and retrieving comments for bookings
 */
import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  bookings,
  bookingComments,
  insertBookingCommentSchema,
} from &quot;@/shared/schema&quot;;
import { getAuthSession } from &quot;@/lib/session&quot;;
import { eq, desc, and } from &quot;drizzle-orm&quot;;
import { z } from &quot;zod&quot;;

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
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;

    // Get the booking to check permissions
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      return NextResponse.json({ error: &quot;Booking not found&quot; }, { status: 404 });
    }

    // Check permissions
    const isAdmin = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
    ].includes(user.role);
    const isInClientOrg =
      booking.clientOrganizationId === (user as any).organizationId;

    if (!isAdmin && !isInClientOrg) {
      return NextResponse.json({ error: &quot;Forbidden&quot; }, { status: 403 });
    }

    // Query to get comments with proper condition handling
    const conditions = [eq(bookingComments.bookingId, id)];
    
    // If not admin, filter out internal comments
    if (!isAdmin) {
      conditions.push(eq(bookingComments.isInternal, false));
    }

    const comments = await db
      .select()
      .from(bookingComments)
      .where(and(...conditions))
      .orderBy(desc(bookingComments.createdAt));

    return NextResponse.json(comments);
  } catch (error) {
    console.error(&quot;Error fetching booking comments:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch comments&quot; },
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
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Get the booking to check permissions
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      return NextResponse.json({ error: &quot;Booking not found&quot; }, { status: 404 });
    }

    // Check permissions
    const isAdmin = [
      &quot;super_admin&quot;,
      &quot;internal_admin&quot;,
      &quot;internal_field_manager&quot;,
    ].includes(user.role);
    const isInClientOrg =
      booking.clientOrganizationId === (user as any).organizationId;

    if (!isAdmin && !isInClientOrg) {
      return NextResponse.json({ error: &quot;Forbidden&quot; }, { status: 403 });
    }

    // Non-admins can&apos;t create internal comments
    if (!isAdmin && data.isInternal) {
      return NextResponse.json(
        {
          error: &quot;Only administrators can create internal comments&quot;,
        },
        { status: 403 },
      );
    }

    // Validate the comment data
    const commentData = insertBookingCommentSchema.parse({
      bookingId: id,
      userId: user.id,
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
    console.error(&quot;Error creating booking comment:&quot;, error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: &quot;Validation failed&quot;,
          details: error.format(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to create comment&quot; },
      { status: 500 },
    );
  }
}
