import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;../../../../lib/db-connection&quot;;
import { locations, brandLocations } from &quot;@shared/schema&quot;;
import { eq, and, not, inArray, like, ilike, SQL } from &quot;drizzle-orm&quot;;
import { getCurrentUser } from &quot;@/lib/auth&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;
import { sql } from &quot;drizzle-orm&quot;;

// Get all approved locations
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, &quot;view:locations&quot;))) {
      return NextResponse.json(
        { error: &quot;Forbidden: Insufficient permissions&quot; },
        { status: 403 },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const excludeBrandId = url.searchParams.get(&quot;excludeBrandId&quot;) || undefined;
    const stateId = url.searchParams.get(&quot;stateId&quot;) || undefined;
    const searchTerm = url.searchParams.get(&quot;search&quot;) || undefined;

    // Build the query with only columns that exist in the database
    let baseQuery = db
      .select({
        id: locations.id,
        name: locations.name,
        type: locations.type,
        address1: locations.address1,
        address2: locations.address2,
        city: locations.city,
        stateId: locations.state_id,
        zipcode: locations.zipcode,
        phone: locations.phone,
        email: locations.email,
        website: locations.website,
        contactName: locations.contactName,
        contactEmail: locations.contactEmail,
        contactPhone: locations.contactPhone,
        notes: locations.notes,
        requestedBy: locations.requested_by,
        status: locations.status,
        geoLat: locations.geo_lat,
        geoLng: locations.geo_lng,
        createdAt: locations.created_at,
        updatedAt: locations.updated_at,
      })
      .from(locations);

    // Create the where conditions
    const whereConditions = [eq(locations.status, &quot;approved&quot;)];

    // Add filters if provided
    if (stateId) {
      whereConditions.push(eq(locations.state_id, stateId));
    }

    if (searchTerm) {
      whereConditions.push(sql`${locations.name} ILIKE ${`%${searchTerm}%`}`);
    }

    // Build the query with all where conditions
    const query = baseQuery.where(and(...whereConditions));

    // Execute the query
    const approvedLocations = await query;

    // If excludeBrandId is provided, we'll need to filter out locations that are already
    // associated with the brand. This requires a separate query to get those location IDs.
    if (excludeBrandId) {
      // Get all location IDs already associated with this brand
      const brandLocationIds = await db
        .select({ locationId: brandLocations.locationId })
        .from(brandLocations)
        .where(eq(brandLocations.brandId, excludeBrandId));

      // Extract just the IDs
      const locationIdsToExclude = brandLocationIds.map(
        (item) => item.locationId,
      );

      // Filter out those locations if any were found
      if (locationIdsToExclude.length > 0) {
        return NextResponse.json({
          locations: approvedLocations.filter(
            (location) => !locationIdsToExclude.includes(location.id),
          ),
        });
      }
    }

    return NextResponse.json({ locations: approvedLocations });
  } catch (error) {
    console.error(`Error fetching approved locations:`, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch approved locations&quot; },
      { status: 500 },
    );
  }
}
