import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@db";
import { kits, kitComponentInventory } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import { getOrganizationHeaderData } from "@/lib/organization-context";
import { checkPermission } from "@/lib/rbac";

// Helper function to get kit by ID
async function getKit(id: number) {
  const [kit] = await db.select().from(kits).where(eq(kits.id, id));
  return kit;
}

// GET /api/kits/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to view kits
    const hasPermission = await checkPermission(req, "read:staff");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to view this kit" },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kit ID" }, { status: 400 });
    }

    // Get the kit
    const kit = await getKit(id);
    if (!kit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    // Get the kit's component inventory
    const components = await db
      .select()
      .from(kitComponentInventory)
      .where(eq(kitComponentInventory.kitId, id));

    // Return the kit with its component inventory
    return NextResponse.json({
      ...kit,
      componentInventory: components,
    });
  } catch (error) {
    console.error("Error fetching kit:", error);
    return NextResponse.json({ error: "Failed to fetch kit" }, { status: 500 });
  }
}

// PUT /api/kits/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to update kits
    const hasPermission = await checkPermission(req, "update:staff");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to update this kit" },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kit ID" }, { status: 400 });
    }

    // Check if kit exists
    const existingKit = await getKit(id);
    if (!existingKit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();

    // Update the kit
    const [updatedKit] = await db
      .update(kits)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(kits.id, id))
      .returning();

    return NextResponse.json(updatedKit);
  } catch (error) {
    console.error("Error updating kit:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update kit" },
      { status: 500 },
    );
  }
}

// DELETE /api/kits/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get organization context from request headers
    const organizationData = await getOrganizationHeaderData(req);

    // Check if user has permission to delete kits
    const hasPermission = await checkPermission(req, "delete:staff");
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to delete this kit" },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kit ID" }, { status: 400 });
    }

    // Check if kit exists
    const existingKit = await getKit(id);
    if (!existingKit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    // Delete the kit (this will cascade delete the component inventory)
    await db.delete(kits).where(eq(kits.id, id));

    return NextResponse.json({ message: "Kit deleted successfully" });
  } catch (error) {
    console.error("Error deleting kit:", error);
    return NextResponse.json(
      { error: "Failed to delete kit" },
      { status: 500 },
    );
  }
}
