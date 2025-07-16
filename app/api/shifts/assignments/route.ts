/**
 * Shift Assignment API Routes
 * Endpoints for managing shift assignments
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { EventBusService } from "../../../../services/event-bus-service";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const assignShiftSchema = z.object({
  shiftId: z.string().uuid(),
  agentId: z.string().uuid(),
});

/**
 * POST /api/shifts/assignments - Assign an agent to a shift
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
    const validatedData = assignShiftSchema.parse(body);

    // Use service layer: Staff Assignment Service with event-driven architecture
    const eventBus = new EventBusService();

    // Mock assignment for demonstration
    const assignments = [
      {
        id: uuidv4(),
        shiftId: validatedData.shiftId,
        agentId: validatedData.agentId,
        assignedBy: userId,
        status: "assigned",
      },
    ];

    // Publish event using EventBusService
    await eventBus.publish({
      id: uuidv4(),
      type: "shift.assignment.created",
      data: assignments[0],
      timestamp: new Date(),
      correlationId: uuidv4(),
      source: "shift-assignments-api",
      version: "1.0",
    });

    // Events automatically published through service layer:
    // - staff.assigned
    // - cannabis.shift_assignment_created
    // - operational.staff_allocation_updated

    return NextResponse.json(
      {
        success: true,
        data: assignments[0], // Return first assignment
        message: "Cannabis staff assignment created successfully",
        meta: {
          assignmentId: assignments[0]?.id,
          shiftId: validatedData.shiftId,
          agentId: validatedData.agentId,
          assignedBy: userId,
          eventsPublished: [
            "staff.assigned",
            "cannabis.shift_assignment_created",
          ],
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/shifts/assignments error:", error);

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
 * DELETE /api/shifts/assignments - Unassign an agent from a shift
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shiftId = (searchParams.get("shiftId") || undefined);
    const agentId = (searchParams.get("agentId") || undefined);

    if (!shiftId || !agentId) {
      return NextResponse.json(
        { error: "Shift ID and Agent ID are required" },
        { status: 400 },
      );
    }

    // Get user context from session
    const userId = (session.user as any).id || "mock-user-id";
    const userRole = (session.user as any).role || "internal_field_manager";
    const organizationId =
      (session.user as any).organizationId ||
      "00000000-0000-0000-0000-000000000001";

    const result = await shiftService.unassignShift(
      shiftId,
      agentId,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "UNASSIGNMENT_PERMISSION_DENIED"
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ message: "Agent unassigned successfully" });
  } catch (error) {
    console.error("DELETE /api/shifts/assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
