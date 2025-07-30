import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextResponse } from &quot;next/server&quot;;
import { db } from &quot;@/lib/db&quot;;
import { items } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;

// GET /api/items/[id] - Get a single item by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid item ID&quot; }, { status: 400 });
    }

    const [item] = await db.select().from(items).where(eq(items.id, id));

    if (!item) {
      return NextResponse.json({ error: &quot;Item not found&quot; }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(&quot;Failed to fetch item:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch item&quot; },
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
      return NextResponse.json({ error: &quot;Invalid item ID&quot; }, { status: 400 });
    }

    const body = await request.json();

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existingItem) {
      return NextResponse.json({ error: &quot;Item not found&quot; }, { status: 404 });
    }

    // Update the item
    const [updatedItem] = await db
      .update(items)
      .set(body)
      .where(eq(items.id, id))
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(&quot;Failed to update item:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to update item&quot; },
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
      return NextResponse.json({ error: &quot;Invalid item ID&quot; }, { status: 400 });
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));

    if (!existingItem) {
      return NextResponse.json({ error: &quot;Item not found&quot; }, { status: 404 });
    }

    // Delete the item
    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json(
      { message: &quot;Item deleted successfully&quot; },
      { status: 200 },
    );
  } catch (error) {
    console.error(&quot;Failed to delete item:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to delete item&quot; },
      { status: 500 },
    );
  }
}
