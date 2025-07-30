/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Shifts API Routes
 * RESTful endpoints for shift management operations
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { ShiftService } from &quot;../../services/shifts/ShiftService&quot;;
import { createShiftSchema, ShiftFilters } from &quot;../../services/shifts/models&quot;;

const shiftService = new ShiftService();

/**
 * GET /api/shifts - Get all shifts with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filters: ShiftFilters = {
      ...((searchParams.get(&quot;organizationId&quot;) || undefined) && { organizationId: (searchParams.get(&quot;organizationId&quot;) || undefined) }),
      ...((searchParams.get(&quot;bookingId&quot;) || undefined) && { bookingId: (searchParams.get(&quot;bookingId&quot;) || undefined) }),
      ...((searchParams.get(&quot;locationId&quot;) || undefined) && { locationId: (searchParams.get(&quot;locationId&quot;) || undefined) }),
      ...((searchParams.get(&quot;brandId&quot;) || undefined) && { brandId: (searchParams.get(&quot;brandId&quot;) || undefined) }),
      ...((searchParams.get(&quot;status&quot;) || undefined) && { status: (searchParams.get(&quot;status&quot;) || undefined) as any }),
      ...((searchParams.get(&quot;agentId&quot;) || undefined) && { agentId: (searchParams.get(&quot;agentId&quot;) || undefined) }),
      startDate: (searchParams.get(&quot;startDate&quot;) || undefined)
        ? new Date((searchParams.get(&quot;startDate&quot;) || undefined)!)
        : undefined,
      endDate: (searchParams.get(&quot;endDate&quot;) || undefined)
        ? new Date((searchParams.get(&quot;endDate&quot;) || undefined)!)
        : undefined,
    };

    // Get user context from session
    const userId = (session.user as any).id || &quot;mock-user-id&quot;;
    const userRole = (session.user as any).role || &quot;brand_agent&quot;;
    const organizationId =
      (session.user as any).organizationId ||
      &quot;00000000-0000-0000-0000-000000000001&quot;;

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
    console.error(&quot;GET /api/shifts error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Internal server error&quot; },
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
    console.error(&quot;POST /api/shifts error:&quot;, error);

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
