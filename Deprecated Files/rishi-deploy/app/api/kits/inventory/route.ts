import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@db";
import {
  kitComponentInventory,
  insertKitComponentInventorySchema,
  kits,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getOrganizationHeaderData } from "../../../lib/organization-context";
import { checkPermission } from "../../../lib/rbac";

// GET /api/kits/inventory
export async function GET(req: NextRequest) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to view kit inventory
    const hasPermission = await checkPermission(req, "view:kit-inventory");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view kit inventory" },
        { status: 403 },
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const kitId = searchParams.get("kitId");
    const lowStock = searchParams.get("lowStock");

    // Build the query
    let query = db.select().from(kitComponentInventory);

    // Apply filters if provided
    if (kitId) {
      query = query.where(eq(kitComponentInventory.kitId, parseInt(kitId)));
    }

    if (lowStock === "true") {
      // Get components where quantity is below lowThreshold
      query = query.where(
        and(
          kitComponentInventory.lowThreshold.isNotNull(),
          kitComponentInventory.quantity.lte(
            kitComponentInventory.lowThreshold,
          ),
        ),
      );
    }

    // Execute the query
    const inventory = await query;

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching kit inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch kit inventory" },
      { status: 500 },
    );
  }
}

// POST /api/kits/inventory
export async function POST(req: NextRequest) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to update kit inventory
    const hasPermission = await checkPermission(req, "inventory:kits");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to update kit inventory" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = insertKitComponentInventorySchema.parse(body);

    // Check if the kit exists
    const kitId = validatedData.kitId;
    const [kit] = await db.select().from(kits).where(eq(kits.id, kitId));
    if (!kit) {
      return NextResponse.json(
        { error: "Kit does not exist" },
        { status: 400 },
      );
    }

    // Check if component inventory already exists
    const [existingInventory] = await db
      .select()
      .from(kitComponentInventory)
      .where(
        and(
          eq(kitComponentInventory.kitId, kitId),
          eq(kitComponentInventory.componentId, validatedData.componentId),
        ),
      );

    let result;
    if (existingInventory) {
      // Update existing inventory
      const [updated] = await db
        .update(kitComponentInventory)
        .set({
          quantity: validatedData.quantity,
          maxQuantity: validatedData.maxQuantity,
          lowThreshold: validatedData.lowThreshold,
          lastRestockedDate: validatedData.lastRestockedDate || new Date(),
          isConsumable: validatedData.isConsumable,
          notes: validatedData.notes,
          updatedAt: new Date(),
        })
        .where(eq(kitComponentInventory.id, existingInventory.id))
        .returning();
      result = updated;
    } else {
      // Insert new inventory
      const [inserted] = await db
        .insert(kitComponentInventory)
        .values({
          ...validatedData,
          lastRestockedDate: validatedData.lastRestockedDate || new Date(),
        })
        .returning();
      result = inserted;
    }

    // Update the kit's last inventory date
    await db
      .update(kits)
      .set({ lastInventoryDate: new Date(), updatedAt: new Date() })
      .where(eq(kits.id, kitId));

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error updating kit inventory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update kit inventory" },
      { status: 500 },
    );
  }
}
