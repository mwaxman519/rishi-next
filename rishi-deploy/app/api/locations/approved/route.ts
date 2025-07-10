import { NextRequest, NextResponse } from "next/server";
import { db } from "@db";
import { locations, brandLocations } from "@shared/schema";
import { eq, and, not, inArray, like, ilike, SQL } from "drizzle-orm";
import { getCurrentUser } from "../../../lib/auth";
import { checkPermission } from "../../../lib/rbac";
import { sql } from "drizzle-orm";

// Get all approved locations
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view locations
    if (!(await checkPermission(req, "view:locations"))) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const excludeBrandId = url.searchParams.get("excludeBrandId");
    const stateId = url.searchParams.get("stateId");
    const searchTerm = url.searchParams.get("search");

    // Build the query with only columns that exist in the database
    let baseQuery = db
      .select({
        id: locations.id,
        name: locations.name,
        type: locations.type,
        address1: locations.address1,
        address2: locations.address2,
        city: locations.city,
        stateId: locations.stateId,
        zipcode: locations.zipcode,
        phone: locations.phone,
        email: locations.email,
        website: locations.website,
        contactName: locations.contactName,
        contactEmail: locations.contactEmail,
        contactPhone: locations.contactPhone,
        notes: locations.notes,
        requestedBy: locations.requestedBy,
        status: locations.status,
        geoLat: locations.geoLat,
        geoLng: locations.geoLng,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(locations);

    // Create the where conditions
    const whereConditions = [eq(locations.status, "approved")];

    // Add filters if provided
    if (stateId) {
      whereConditions.push(eq(locations.stateId, stateId));
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
      { error: "Failed to fetch approved locations" },
      { status: 500 },
    );
  }
}
