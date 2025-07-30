/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Shift Lifecycle API Routes
 * Endpoints for managing shift status transitions
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { ShiftService } from &quot;../../../services/shifts/ShiftService&quot;;

const shiftService = new ShiftService();

/**
 * POST /api/shifts/lifecycle - Handle shift lifecycle operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();
    const { action, shiftId, reason } = body;

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;internal_field_manager&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

    if (!action || !shiftId) {
      return NextResponse.json(
        { error: &quot;Action and shift ID are required&quot; },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case &quot;start&quot;:
        result = await shiftService.startShift(
          shiftId,
          userId,
          userRole,
          organizationId,
        );
        break;

      case &quot;complete&quot;:
        result = await shiftService.completeShift(
          shiftId,
          userId,
          userRole,
          organizationId,
        );
        break;

      case &quot;cancel&quot;:
        if (!reason) {
          return NextResponse.json(
            { error: &quot;Reason is required for cancellation&quot; },
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
            error: &quot;Invalid action. Valid actions are: start, complete, cancel&quot;,
          },
          { status: 400 },
        );
    }

    if (!result.success) {
      const status =
        result.code === &quot;NOT_FOUND&quot;
          ? 404
          : result.code?.includes(&quot;PERMISSION_DENIED&quot;)
            ? 403
            : 400;
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(&quot;POST /api/shifts/lifecycle error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
      { status: 500 },
    );
  }
}
