import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  brandLocations,
  brands,
  locations,
} from "@/shared/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { checkPermission } from "@/lib/rbac";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Get all locations for a specific brand
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await params;
    const organizationId = (user as any).organizationId;

    // Check if the brand belongs to the user's organization
    const brandExists = await db
      .select({ id: brands.id })
      .from(brands)
      .where(and(eq(brands.id, brandId), eq(brands.organizationId, organizationId)))
      .limit(1);

    if (brandExists.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Get all brand locations with location details
    const result = await db
      .select({
        id: brandLocations.id,
        brandId: brandLocations.brandId,
        locationId: brandLocations.locationId,
        active: brandLocations.active,
        createdAt: brandLocations.createdAt,
        location: {
          id: locations.id,
          name: locations.name,
          address: locations.address1,
          city: locations.city,
          state: locations.state_id,
          zipCode: locations.zipcode,
          latitude: locations.geo_lat,
          longitude: locations.geo_lng,
          type: locations.type,
          status: locations.status,
          submittedById: locations.requested_by,
          createdAt: locations.created_at,
          updatedAt: locations.updated_at,
        },
      })
      .from(brandLocations)
      .leftJoin(locations, eq(brandLocations.locationId, locations.id))
      .where(eq(brandLocations.brandId, brandId));

    return NextResponse.json({ brandLocations: result });
  } catch (error) {
    console.error(`Error fetching brand locations:`, error);
    return NextResponse.json(
      { error: "Failed to fetch brand locations" },
      { status: 500 },
    );
  }
}

// Schema for adding a location to a brand
const addLocationSchema = z.object({
  locationId: z.string().uuid(),
});

// Add a location to a brand
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId } = await params;
    const organizationId = (user as any).organizationId;

    // Check if the brand belongs to the user's organization
    const brandExists = await db
      .select({ id: brands.id })
      .from(brands)
      .where(and(eq(brands.id, brandId), eq(brands.organizationId, organizationId)))
      .limit(1);

    if (brandExists.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Validate request body
    const body = await req.json();
    const validationResult = addLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { locationId } = validationResult.data;

    // Check if the location exists and is approved
    const locationExists = await db
      .select({ id: locations.id, status: locations.status })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);

    if (locationExists.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    if (locationExists[0].status !== "approved") {
      return NextResponse.json(
        { error: "Location is not approved for use" },
        { status: 400 },
      );
    }

    // Check if the location is already added to this brand
    const existingBrandLocation = await db
      .select({ id: brandLocations.id })
      .from(brandLocations)
      .where(
        and(
          eq(brandLocations.brandId, brandId),
          eq(brandLocations.locationId, locationId),
        ),
      )
      .limit(1);

    if (existingBrandLocation.length > 0) {
      return NextResponse.json(
        { error: "Location is already added to this brand" },
        { status: 400 },
      );
    }

    // Add location to brand
    const newBrandLocation = {
      id: uuidv4(),
      brandId,
      locationId,
      active: true, // Active by default when added
      createdAt: new Date().toISOString(),
    };

    await db.insert(brandLocations).values(newBrandLocation);

    return NextResponse.json({
      message: "Location added to brand successfully",
      brandLocation: newBrandLocation,
    });
  } catch (error) {
    console.error(`Error adding location to brand:`, error);
    return NextResponse.json(
      { error: "Failed to add location to brand" },
      { status: 500 },
    );
  }
}
