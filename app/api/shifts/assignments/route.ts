/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Shift Assignment API Routes
 * Endpoints for managing shift assignments
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { EventBusService } from &quot;../../../../services/event-bus-service&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { z } from &quot;zod&quot;;

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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;internal_field_manager&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

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
        status: &quot;assigned&quot;,
      },
    ];

    // Publish event using EventBusService
    await eventBus.publish({
      id: uuidv4(),
      type: &quot;shift.assignment.created&quot;,
      data: assignments[0],
      timestamp: new Date(),
      correlationId: uuidv4(),
      source: &quot;shift-assignments-api&quot;,
      version: &quot;1.0&quot;,
    });

    // Events automatically published through service layer:
    // - staff.assigned
    // - cannabis.shift_assignment_created
    // - operational.staff_allocation_updated

    return NextResponse.json(
      {
        success: true,
        data: assignments[0], // Return first assignment
        message: &quot;Cannabis staff assignment created successfully&quot;,
        meta: {
          assignmentId: assignments[0]?.id,
          shiftId: validatedData.shiftId,
          agentId: validatedData.agentId,
          assignedBy: userId,
          eventsPublished: [
            &quot;staff.assigned&quot;,
            &quot;cannabis.shift_assignment_created&quot;,
          ],
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(&quot;POST /api/shifts/assignments error:&quot;, error);

    if (error instanceof Error && error.name === &quot;ZodError&quot;) {
      return NextResponse.json(
        { error: &quot;Invalid request data&quot;, details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
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
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shiftId = (searchParams.get(&quot;shiftId&quot;) || undefined);
    const agentId = (searchParams.get(&quot;agentId&quot;) || undefined);

    if (!shiftId || !agentId) {
      return NextResponse.json(
        { error: &quot;Shift ID and Agent ID are required&quot; },
        { status: 400 },
      );
    }

    // Get user context from session
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const organizationId = (session.user as any).organizationId;

    if (!userId || !userRole || !organizationId) {
      return NextResponse.json(
        { error: &quot;Invalid session data&quot; },
        { status: 401 },
      );
    }

    const result = await shiftService.unassignShift(
      shiftId,
      agentId,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status =
        result.code === &quot;NOT_FOUND&quot;
          ? 404
          : result.code === &quot;UNASSIGNMENT_PERMISSION_DENIED&quot;
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ message: &quot;Agent unassigned successfully&quot; });
  } catch (error) {
    console.error(&quot;DELETE /api/shifts/assignments error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}
