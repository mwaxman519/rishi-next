import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { items } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";

// GET /api/items/[id] - Get a single item by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [item] = await db.select().from(items).where(eq(items.id, id));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 },
    );
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const body = await request.json();

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update the item
    const [updatedItem] = await db
      .update(items)
      .set(body)
      .where(eq(items.id, id))
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item
    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}
