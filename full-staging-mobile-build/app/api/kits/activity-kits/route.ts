/**

export const dynamic = "force-static";
export const revalidate = false;

 * Activity Kit Assignment API Routes
 */
import { NextRequest, NextResponse } from "next/server";
import { kitsService } from "../../../services/kits";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-server";

/**
 * GET /api/kits/activity-kits
 * Get all activity kit assignments with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const filters: Record<string, any> = {};

    // Extract filter parameters
    if (searchParams.has("activityId")) {
      filters.activityId = (searchParams.get("activityId") || undefined);
    }

    if (searchParams.has("kitTemplateId")) {
      filters.kitTemplateId = (searchParams.get("kitTemplateId") || undefined);
    }

    if (searchParams.has("kitInstanceId")) {
      filters.kitInstanceId = (searchParams.get("kitInstanceId") || undefined);
    }

    if (searchParams.has("status")) {
      filters.status = (searchParams.get("status") || undefined);
    }

    if (searchParams.has("assignedToId")) {
      filters.assignedToId = (searchParams.get("assignedToId") || undefined);
    }

    // Get all activity kits with filters
    const activityKits = await kitsService.getAllActivityKits(filters);

    return NextResponse.json(activityKits);
  } catch (error) {
    console.error("Error fetching activity kits:", error);
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
 * POST /api/kits/activity-kits
 * Create a new activity kit assignment
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();

    // Create activity kit assignment
    const activityKit = await kitsService.createActivityKit(data);

    return NextResponse.json(activityKit, { status: 201 });
  } catch (error) {
    console.error("Error creating activity kit assignment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}
