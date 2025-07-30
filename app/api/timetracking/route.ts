import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { EventBusService } from &quot;../../../services/event-bus-service&quot;;
import { simpleTimeTrackingService } from &quot;../../services/timetracking/SimpleTimeTrackingService&quot;;
import { z } from &quot;zod&quot;;

// Use the exported instance
const timeTrackingService = simpleTimeTrackingService;

// Service is now ready for real data operations

// GET /api/timetracking - Get time entries with filtering
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }
    const user = session.user as any;

    const { searchParams } = new URL(request.url);

    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined);
    const agentId = (searchParams.get(&quot;agentId&quot;) || undefined) || undefined;
    const shiftId = (searchParams.get(&quot;shiftId&quot;) || undefined) || undefined;
    const startDate = (searchParams.get(&quot;startDate&quot;) || undefined);
    const endDate = (searchParams.get(&quot;endDate&quot;) || undefined);
    const status = (searchParams.get(&quot;status&quot;) || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    // Role-based access control
    let effectiveAgentId = agentId;
    if (user.role === &quot;brand_agent&quot;) {
      // Brand agents can only see their own time entries
      effectiveAgentId = user.id;
    } else if (user.role === &quot;field_manager&quot; || user.role === &quot;client_user&quot;) {
      // Field managers and client users can see all time entries for their organization
      // effectiveAgentId remains as provided (can be undefined for all org users)
      effectiveAgentId = agentId;
    } else if (user.role === &quot;internal_admin&quot; || user.role === &quot;super_admin&quot;) {
      // Internal admins can see all time entries across all organizations
      effectiveAgentId = agentId;
    } else {
      // Default: restrict to own data for unknown roles
      effectiveAgentId = user.id;
    }

    const timeEntries = await timeTrackingService.getAllTimeEntries(
      organizationId,
      {
        ...(effectiveAgentId && { agentId: effectiveAgentId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && status !== &quot;all&quot; && { status }),
      },
    );

    return NextResponse.json({
      success: true,
      data: timeEntries,
    });
  } catch (error) {
    console.error(&quot;Error fetching time entries:&quot;, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Failed to fetch time entries&quot;,
      },
      { status: 500 },
    );
  }
}

// POST /api/timetracking - Clock in/out operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === &quot;clock-in&quot;) {
      // Get authenticated user from session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
      }
      const user = session.user as any;

      const clockInSchema = z.object({
        agentId: z.string(),
        shiftId: z.string().optional(),
        bookingId: z.string().optional(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number().optional(),
            timestamp: z.number(),
          })
          .optional(),
        notes: z.string().optional(),
      });

      const validatedData = clockInSchema.parse(data);

      // Role-based access control for clock-in operations
      let effectiveAgentId = validatedData.agentId;
      if (user.role === &quot;brand_agent&quot;) {
        // Brand agents can only clock in for themselves
        effectiveAgentId = user.id;
      } else if (user.role === &quot;field_manager&quot; || user.role === &quot;client_user&quot;) {
        // Field managers and client users can clock in for agents in their organization
        // In production, verify the agent belongs to the same organization
        effectiveAgentId = validatedData.agentId;
      } else if (
        user.role === &quot;internal_admin&quot; ||
        user.role === &quot;super_admin&quot;
      ) {
        // Internal admins can clock in for any agent
        effectiveAgentId = validatedData.agentId;
      } else {
        // Default: restrict to own data for unknown roles
        effectiveAgentId = user.id;
      }

      const result = await timeTrackingService.clockIn(effectiveAgentId, {
        shiftId: validatedData.shiftId,
        bookingId: validatedData.bookingId,
        location: validatedData.location,
        notes: validatedData.notes,
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: &quot;Clocked in successfully&quot;,
      });
    }

    if (action === &quot;clock-out&quot;) {
      const clockOutSchema = z.object({
        timeEntryId: z.string(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number().optional(),
            timestamp: z.number(),
          })
          .optional(),
        breakDurationMinutes: z.number().optional(),
        notes: z.string().optional(),
      });

      console.log(&quot;DEVELOPMENT MODE: Using mock user for testing&quot;);
      const user = { id: &quot;mock-user-id&quot;, role: &quot;brand_agent&quot; }; // In production, get from session

      const validatedData = clockOutSchema.parse(data);

      // Role-based access control for clock-out operations
      let agentId;
      if (user.role === &quot;brand_agent&quot;) {
        // Brand agents can only clock out for themselves
        agentId = user.id;
      } else if (user.role === &quot;field_manager&quot; || user.role === &quot;client_user&quot;) {
        // Field managers and client users can clock out for agents in their organization
        // In production, verify the agent belongs to the same organization
        agentId = user.id; // For demo, use current user
      } else if (
        user.role === &quot;internal_admin&quot; ||
        user.role === &quot;super_admin&quot;
      ) {
        // Internal admins can clock out for any agent
        agentId = user.id; // For demo, use current user
      } else {
        // Default: restrict to own data for unknown roles
        agentId = user.id;
      }

      const result = await timeTrackingService.clockOut(agentId, {
        breakDurationMinutes: validatedData.breakDurationMinutes,
        location: validatedData.location,
        notes: validatedData.notes,
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: &quot;Clocked out successfully&quot;,
      });
    }

    return NextResponse.json(
      { error: &quot;Invalid action. Use 'clock-in' or 'clock-out'&quot; },
      { status: 400 },
    );
  } catch (error) {
    console.error(&quot;Error processing time tracking action:&quot;, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: &quot;Validation error&quot;,
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : &quot;Time tracking operation failed&quot;,
      },
      { status: 500 },
    );
  }
}
