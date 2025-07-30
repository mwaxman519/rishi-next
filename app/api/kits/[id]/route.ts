import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { z } from &quot;zod&quot;;
import { db } from &quot;../../../../lib/db-connection&quot;;
import { kits, kitComponentInventory } from &quot;@shared/schema&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { getOrganizationHeaderData } from &quot;@/lib/organization-context&quot;;
import { checkPermission } from &quot;@/lib/rbac&quot;;

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
    const hasPermission = await checkPermission(req, &quot;read:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to view this kit&quot; },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid kit ID&quot; }, { status: 400 });
    }

    // Get the kit
    const kit = await getKit(id);
    if (!kit) {
      return NextResponse.json({ error: &quot;Kit not found&quot; }, { status: 404 });
    }

    // Get the kit&apos;s component inventory
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
    console.error(&quot;Error fetching kit:&quot;, error);
    return NextResponse.json({ error: &quot;Failed to fetch kit&quot; }, { status: 500 });
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
    const hasPermission = await checkPermission(req, &quot;update:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to update this kit&quot; },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid kit ID&quot; }, { status: 400 });
    }

    // Check if kit exists
    const existingKit = await getKit(id);
    if (!existingKit) {
      return NextResponse.json({ error: &quot;Kit not found&quot; }, { status: 404 });
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
    console.error(&quot;Error updating kit:&quot;, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: &quot;Validation error&quot;, details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: &quot;Failed to update kit&quot; },
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
    const hasPermission = await checkPermission(req, &quot;delete:staff&quot;);
    if (!hasPermission) {
      return NextResponse.json(
        { error: &quot;You do not have permission to delete this kit&quot; },
        { status: 403 },
      );
    }

    const { id: kitId } = await params;
    const id = parseInt(kitId);
    if (isNaN(id)) {
      return NextResponse.json({ error: &quot;Invalid kit ID&quot; }, { status: 400 });
    }

    // Check if kit exists
    const existingKit = await getKit(id);
    if (!existingKit) {
      return NextResponse.json({ error: &quot;Kit not found&quot; }, { status: 404 });
    }

    // Delete the kit (this will cascade delete the component inventory)
    await db.delete(kits).where(eq(kits.id, id));

    return NextResponse.json({ message: &quot;Kit deleted successfully&quot; });
  } catch (error) {
    console.error(&quot;Error deleting kit:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to delete kit&quot; },
      { status: 500 },
    );
  }
}
