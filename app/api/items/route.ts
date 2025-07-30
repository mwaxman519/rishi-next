import { NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { db } from &quot;@/lib/db&quot;;
import { items, insertItemSchema } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { z } from &quot;zod&quot;;

// GET /api/items - Get all items
export async function GET(): Promise<NextResponse> {
  try {
    const allItems = await db.select().from(items);
    return NextResponse.json(allItems);
  } catch (error) {
    console.error(&quot;Failed to fetch items:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch items&quot; },
      { status: 500 },
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Use the existing schema from shared/schema.ts for validation
    const validatedData = insertItemSchema.parse(body);

    // Wrap data in an array for Drizzle's insert operation
    const newItems = await db.insert(items).values([validatedData]).returning();

    return NextResponse.json(newItems[0], { status: 201 });
  } catch (error) {
    console.error(&quot;Failed to create item:&quot;, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Failed to create item&quot; },
      { status: 500 },
    );
  }
}
