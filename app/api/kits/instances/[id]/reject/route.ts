/**
 * API Route for rejecting a kit instance
 */
import { NextRequest, NextResponse } from "next/server";
import { kitsService } from "../../../../../services/kits";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

/**
 * POST /api/kits/instances/[id]/reject
 * Reject a kit instance
 */
export async function POST(
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
    const { reason } = await req.json();

    // Reason is required
    if (!reason) {
      return NextResponse.json(
        { error: "A reason is required for rejection" },
        { status: 400 },
      );
    }

    // Reject kit
    const kit = await kitsService.rejectKit({ id, reason }, session.user.id);

    return NextResponse.json(kit);
  } catch (error) {
    console.error(`Error rejecting kit with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}
