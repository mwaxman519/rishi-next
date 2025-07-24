/**
 * Shift Lifecycle API Routes
 * Endpoints for managing shift status transitions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ShiftService } from "../../../services/shifts/ShiftService";

const shiftService = new ShiftService();

/**
 * POST /api/shifts/lifecycle - Handle shift lifecycle operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, shiftId, reason } = body;

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "internal_field_manager";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    if (!action || !shiftId) {
      return NextResponse.json(
        { error: "Action and shift ID are required" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "start":
        result = await shiftService.startShift(
          shiftId,
          userId,
          userRole,
          organizationId,
        );
        break;

      case "complete":
        result = await shiftService.completeShift(
          shiftId,
          userId,
          userRole,
          organizationId,
        );
        break;

      case "cancel":
        if (!reason) {
          return NextResponse.json(
            { error: "Reason is required for cancellation" },
            { status: 400 },
          );
        }
        result = await shiftService.cancelShift(
          shiftId,
          userId,
          reason,
          userRole,
          organizationId,
        );
        break;

      default:
        return NextResponse.json(
          {
            error: "Invalid action. Valid actions are: start, complete, cancel",
          },
          { status: 400 },
        );
    }

    if (!result.success) {
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code?.includes("PERMISSION_DENIED")
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/shifts/lifecycle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
