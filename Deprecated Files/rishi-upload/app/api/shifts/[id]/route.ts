/**
 * Individual Shift API Routes
 * RESTful endpoints for single shift operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ShiftService } from "../../../services/shifts/ShiftService";
import { updateShiftSchema } from "../../../services/shifts/models";

const shiftService = new ShiftService();

/**
 * GET /api/shifts/[id] - Get a specific shift
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "brand_agent";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    const result = await shiftService.getShiftById(
      id,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status = result.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`GET /api/shifts/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/shifts/[id] - Update a specific shift
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "internal_field_manager";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    // Validate request body
    const validatedData = updateShiftSchema.parse(body);

    const result = await shiftService.updateShift(
      id,
      validatedData,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "ACCESS_DENIED"
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`PUT /api/shifts/${params.id} error:`, error);

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

/**
 * DELETE /api/shifts/[id] - Delete a specific shift
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "organization_admin";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    const result = await shiftService.deleteShift(
      id,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "ACCESS_DENIED"
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/shifts/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
