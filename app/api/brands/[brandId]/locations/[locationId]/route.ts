import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { brandLocations, brands } from "../../../../../shared/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "../../../lib/auth";
import { z } from "zod";

// Schema for updating a brand location
const updateBrandLocationSchema = z.object({
  active: z.boolean(),
});

// Update a brand location (activate/deactivate)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; locationId: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId, locationId } = await params;
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

    // Check if the brand location exists and belongs to the specified brand
    const existingBrandLocation = await db
      .select()
      .from(brandLocations)
      .where(
        and(
          eq(brandLocations.locationId, locationId),
          eq(brandLocations.brandId, brandId),
        ),
      )
      .limit(1);

    if (existingBrandLocation.length === 0) {
      return NextResponse.json(
        { error: "Brand location not found" },
        { status: 404 },
      );
    }

    // Validate request body
    const body = await req.json();
    const validationResult = updateBrandLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { active } = validationResult.data;

    // Update brand location
    await db
      .update(brandLocations)
      .set({ active })
      .where(
        and(
          eq(brandLocations.locationId, locationId),
          eq(brandLocations.brandId, brandId),
        ),
      );

    return NextResponse.json({
      message: "Brand location updated successfully",
      active,
    });
  } catch (error) {
    console.error(`Error updating brand location:`, error);
    return NextResponse.json(
      { error: "Failed to update brand location" },
      { status: 500 },
    );
  }
}

// Remove a location from a brand
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string; locationId: string }> },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId, locationId } = await params;
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

    // Check if the brand location exists and belongs to the specified brand
    const existingBrandLocation = await db
      .select()
      .from(brandLocations)
      .where(
        and(
          eq(brandLocations.locationId, locationId),
          eq(brandLocations.brandId, brandId),
        ),
      )
      .limit(1);

    if (existingBrandLocation.length === 0) {
      return NextResponse.json(
        { error: "Brand location not found" },
        { status: 404 },
      );
    }

    // Delete the brand location (remove from brand)
    await db
      .delete(brandLocations)
      .where(
        and(
          eq(brandLocations.locationId, locationId),
          eq(brandLocations.brandId, brandId),
        ),
      );

    return NextResponse.json({
      message: "Location removed from brand successfully",
    });
  } catch (error) {
    console.error(`Error removing location from brand:`, error);
    return NextResponse.json(
      { error: "Failed to remove location from brand" },
      { status: 500 },
    );
  }
}
