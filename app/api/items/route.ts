import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { items, insertItemSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// GET /api/items - Get all items
export async function GET(): Promise<NextResponse> {
  try {
    const allItems = await db.select().from(items);
    return NextResponse.json(allItems);
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
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
    console.error("Failed to create item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
