import { generateStaticParams } from &quot;./generateStaticParams&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;


/**
 * Individual Shift API Routes
 * RESTful endpoints for single shift operations
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { ShiftService } from &quot;../../../services/shifts/ShiftService&quot;;
import { updateShiftSchema } from &quot;../../../services/shifts/models&quot;;

const shiftService = new ShiftService();

/**
 * GET /api/shifts/[id] - Get a specific shift
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;brand_agent&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

    const result = await shiftService.getShiftById(
      id,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status = result.code === &quot;NOT_FOUND&quot; ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`GET /api/shifts/${params.id} error:`, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/shifts/[id] - Update a specific shift
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;internal_field_manager&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

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
        result.code === &quot;NOT_FOUND&quot;
          ? 404
          : result.code === &quot;ACCESS_DENIED&quot;
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
 * DELETE /api/shifts/[id] - Delete a specific shift
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { id } = await params;

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;organization_admin&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

    const result = await shiftService.deleteShift(
      id,
      userId,
      userRole,
      organizationId,
    );

    if (!result.success) {
      const status =
        result.code === &quot;NOT_FOUND&quot;
          ? 404
          : result.code === &quot;ACCESS_DENIED&quot;
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ message: &quot;Shift deleted successfully&quot; });
  } catch (error) {
    console.error(`DELETE /api/shifts/${params.id} error:`, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}
