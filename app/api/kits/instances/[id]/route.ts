/**
 * Kit Instance API Routes for specific kit
 */
import { NextRequest, NextResponse } from "next/server";
import { kitsService } from "../../../../services/kits";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/kits/instances/[id]
 * Get a specific kit by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const kit = await kitsService.getKitById(id);
    if (!kit) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }

    return NextResponse.json(kit);
  } catch (error) {
    console.error(`Error fetching kit with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/kits/instances/[id]
 * Update a specific kit
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Parse request body
    const data = await req.json();

    // Update kit
    const kit = await kitsService.updateKit(id, data, (session.user as any).id);

    return NextResponse.json(kit);
  } catch (error) {
    console.error(`Error updating kit with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}
