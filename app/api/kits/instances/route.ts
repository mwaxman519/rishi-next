/**
 * Kit Instances API Routes
 */
import { NextRequest, NextResponse } from "next/server";
import { kitsService } from "../../../services/kits";
import { getCurrentUser } from "../../../lib/auth";

/**
 * GET /api/kits/instances
 * Get all kit instances with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const filters: Record<string, any> = {};

    // Extract filter parameters
    if (searchParams.has("brandRegionId")) {
      filters.brandRegionId = parseInt(
        ((searchParams.get("brandRegionId") || undefined) || undefined) as string,
      );
    }

    if (searchParams.has("templateId")) {
      filters.templateId = parseInt(((searchParams.get("templateId") || undefined) || undefined) as string);
    }

    if (searchParams.has("status")) {
      filters.status = ((searchParams.get("status") || undefined) || undefined);
    }

    if (searchParams.has("approvalStatus")) {
      filters.approvalStatus = ((searchParams.get("approvalStatus") || undefined) || undefined);
    }

    if (searchParams.has("search")) {
      filters.search = ((searchParams.get("search") || undefined) || undefined);
    }

    // Get all kits with filters
    const kits = await kitsService.getAllKits(filters);

    return NextResponse.json(kits);
  } catch (error) {
    console.error("Error fetching kits:", error);
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
 * POST /api/kits/instances
 * Create a new kit instance
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();

    // Create kit
    const kit = await kitsService.createKit(data, user.id);

    return NextResponse.json(kit, { status: 201 });
  } catch (error) {
    console.error("Error creating kit:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 },
    );
  }
}
