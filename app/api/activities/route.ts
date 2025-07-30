

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import {
  activities,
  insertActivitySchema,
  activityTypes,
  locations,
  bookings,
} from &quot;@shared/schema&quot;;
import { getCurrentUser } from &quot;@/lib/auth-server&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { eq, and, gte, lte } from &quot;drizzle-orm&quot;;

// GET /api/activities
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId =
      (searchParams.get(&quot;organizationId&quot;) || undefined) || (user as any).organizationId;
    const typeId = (searchParams.get(&quot;typeId&quot;) || undefined) || undefined;
    const status = (searchParams.get(&quot;status&quot;) || undefined) || undefined;
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined) || undefined;
    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined) || undefined;

    // Build the query with joins to get related data
    // Activities don&apos;t have organizationId - filter through parent booking
    const conditions = [];
    
    if (typeId) {
      conditions.push(eq(activities.activityTypeId, typeId));
    }

    if (status) {
      conditions.push(eq(activities.status, status));
    }

    // Add date filtering if both start and end dates are provided
    // Note: Activities use startTime/endTime (text), not startDate/endDate
    if (startDate && endDate) {
      conditions.push(
        gte(activities.startTime, startDate),
        lte(activities.endTime, endDate),
      );
    }

    let query = db
      .select({
        activity: activities,
        activityType: activityTypes,
        location: locations,
        booking: bookings,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(locations, eq(activities.locationId, locations.id))
      .leftJoin(bookings, eq(activities.bookingId, bookings.id))
      .where(
        conditions.length > 0 
          ? and(eq(bookings.clientOrganizationId, organizationId), ...conditions)
          : eq(bookings.clientOrganizationId, organizationId)
      );

    const results = await query;

    // Format the results for API response
    const formattedResults = results.map((item) => ({
      ...item.activity,
      type: item.activityType
        ? {
            id: item.activityType.id,
            name: item.activityType.name,
            icon: item.activityType.icon,
            color: item.activityType.color,
          }
        : null,
      location: item.location
        ? {
            id: item.location.id,
            name: item.location.name,
            address: item.location.address1,
            city: item.location.city,
            state: item.location.state_id,
            zipCode: item.location.zipcode,
            coordinates: {
              lat: item.location.geo_lat,
              lng: item.location.geo_lng,
            },
          }
        : null,
    }));

    return NextResponse.json({
      data: formattedResults,
      status: 200,
    });
  } catch (error) {
    console.error(&quot;Error fetching activities:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch activities&quot; },
      { status: 500 },
    );
  }
}

// POST /api/activities
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();

    // Validate activity data
    const validatedData = insertActivitySchema.parse({
      ...body,
      createdById: user.id,
    });

    // Create a new UUID for the activity
    const id = uuidv4();

    const result = await db
      .insert(activities)
      .values({
        id,
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // For the response, include related data by fetching the complete activity
    const [activity] = await db
      .select({
        activity: activities,
        activityType: activityTypes,
        location: locations,
      })
      .from(activities)
      .leftJoin(activityTypes, eq(activities.activityTypeId, activityTypes.id))
      .leftJoin(locations, eq(activities.locationId, locations.id))
      .where(eq(activities.id, id));

    // Check if activity data was found after creation
    if (!activity) {
      return NextResponse.json(
        { error: &quot;Activity not found after creation&quot; },
        { status: 500 },
      );
    }

    // Format the response
    const formattedActivity = {
      ...activity.activity,
      type: activity.activityType
        ? {
            id: activity.activityType.id,
            name: activity.activityType.name,
            icon: activity.activityType.icon,
            color: activity.activityType.color,
          }
        : null,
      location: activity.location
        ? {
            id: activity.location.id,
            name: activity.location.name,
            address: activity.location.address1,
            city: activity.location.city,
            state: activity.location.state_id,
            zipCode: activity.location.zipcode,
            coordinates: {
              lat: activity.location.geo_lat,
              lng: activity.location.geo_lng,
            },
          }
        : null,
    };

    return NextResponse.json(
      {
        data: formattedActivity,
        status: 201,
        message: &quot;Activity created successfully&quot;,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error(&quot;Error creating activity:&quot;, error);

    // Handle validation errors
    if (error.name === &quot;ZodError&quot;) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to create activity&quot; },
      { status: 500 },
    );
  }
}
