/**
 * Shifts API Routes
 * RESTful endpoints for shift management operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ShiftService } from "../../services/shifts/ShiftService";
import { createShiftSchema, ShiftFilters } from "../../services/shifts/models";

const shiftService = new ShiftService();

/**
 * GET /api/shifts - Get all shifts with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filters: ShiftFilters = {
      ...((searchParams.get("organizationId") || undefined) && { organizationId: (searchParams.get("organizationId") || undefined) }),
      ...((searchParams.get("bookingId") || undefined) && { bookingId: (searchParams.get("bookingId") || undefined) }),
      ...((searchParams.get("locationId") || undefined) && { locationId: (searchParams.get("locationId") || undefined) }),
      ...((searchParams.get("brandId") || undefined) && { brandId: (searchParams.get("brandId") || undefined) }),
      ...((searchParams.get("status") || undefined) && { status: (searchParams.get("status") || undefined) as any }),
      ...((searchParams.get("agentId") || undefined) && { agentId: (searchParams.get("agentId") || undefined) }),
      startDate: (searchParams.get("startDate") || undefined)
        ? new Date((searchParams.get("startDate") || undefined)!)
        : undefined,
      endDate: (searchParams.get("endDate") || undefined)
        ? new Date((searchParams.get("endDate") || undefined)!)
        : undefined,
    };

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "brand_agent";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    const result = await shiftService.getAllShifts(
      filters,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/shifts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/shifts - Create a new shift
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "internal_field_manager";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    // Validate request body
    const validatedData = createShiftSchema.parse(body);

    const result = await shiftService.createShift(
      validatedData,
      userId,
      organizationId,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/shifts error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
