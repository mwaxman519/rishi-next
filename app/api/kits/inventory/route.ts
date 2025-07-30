import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { z } from &quot;zod&quot;;
import { db } from &quot;../../../../lib/db-connection&quot;;
import {
  kitComponentInventory,
  insertKitComponentInventorySchema,
  kits,
} from &quot;@shared/schema&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;
import { getOrganizationHeaderData } from &quot;@/lib/organization-context&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;

// GET /api/kits/inventory
export async function GET(req: NextRequest) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to view kit inventory
    const hasPermission = await checkPermission(req, &quot;read:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to view kit inventory&quot; },
        { status: 403 },
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const kitId = (searchParams.get(&quot;kitId&quot;) || undefined);
    const lowStock = (searchParams.get(&quot;lowStock&quot;) || undefined);

    // Build the query
    let query = db.select().from(kitComponentInventory);

    // Apply filters if provided
    if (kitId) {
      query = query.where(eq(kitComponentInventory.kitId, parseInt(kitId)));
    }

    if (lowStock === &quot;true&quot;) {
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
    console.error(&quot;Error fetching kit inventory:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch kit inventory&quot; },
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
    const hasPermission = await checkPermission(req, &quot;update:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to update kit inventory&quot; },
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
        { error: &quot;Kit does not exist&quot; },
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
          updated_at: new Date(),
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

    // Update the kit&apos;s last inventory date
    await db
      .update(kits)
      .set({ lastInventoryDate: new Date(), updated_at: new Date() })
      .where(eq(kits.id, kitId));

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(&quot;Error updating kit inventory:&quot;, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: &quot;Failed to update kit inventory&quot; },
      { status: 500 },
    );
  }
}
