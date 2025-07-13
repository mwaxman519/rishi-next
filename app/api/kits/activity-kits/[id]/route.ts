/**
 * Activity Kit Assignment API Routes for specific assignment
 */
import { NextRequest, NextResponse } from "next/server";
import { kitsService } from "../../../../services/kits";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth-server";

/**
 * GET /api/kits/activity-kits/[id]
 * Get a specific activity kit assignment by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const activityKit = await kitsService.getActivityKitById(id);
    if (!activityKit) {
      return NextResponse.json(
        { error: "Activity kit assignment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(activityKit);
  } catch (error) {
    console.error(
      `Error fetching activity kit assignment with ID ${params.id}:`,
      error,
    );
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
 * PATCH /api/kits/activity-kits/[id]
 * Update a specific activity kit assignment
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

    // Parse request body
    const data = await req.json();

    // Update activity kit assignment
    const { id } = await params;
    const activityKit = await kitsService.updateActivityKit(id, data);

    return NextResponse.json(activityKit);
  } catch (error) {
    console.error(
      `Error updating activity kit assignment with ID ${params.id}:`,
      error,
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}

/**
 * DELETE /api/kits/activity-kits/[id]
 * Delete a specific activity kit assignment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete activity kit assignment
    const { id } = await params;
    await kitsService.deleteActivityKit(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `Error deleting activity kit assignment with ID ${params.id}:`,
      error,
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}
