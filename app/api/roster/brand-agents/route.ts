/**

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

 * Brand Agents API Endpoints
 *
 * RESTful API for managing brand agent assignments with comprehensive
 * validation, error handling, and audit trail integration.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { getServerSession } from &quot;next-auth&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { EventBusService } from &quot;../../../../services/event-bus-service&quot;;
import { rosterService } from &quot;../../../services/roster/RosterService&quot;;
import { validateBrandAgentAssignment } from &quot;../../../services/roster/types&quot;;

/**
 * GET /api/roster/brand-agents
 *
 * Retrieve brand agents for an organization with optional brand filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get(&quot;organizationId&quot;) || undefined);
    const brandId = (searchParams.get(&quot;brandId&quot;) || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: &quot;Organization ID is required&quot; },
        { status: 400 },
      );
    }

    console.log(
      `[API] Retrieving brand agents for organization: ${organizationId}`,
      {
        brandId,
        timestamp: new Date().toISOString(),
      },
    );

    const brandAgents = await rosterService.getBrandAgents(
      organizationId,
      brandId,
    );

    return NextResponse.json({
      success: true,
      data: brandAgents,
      meta: {
        total: brandAgents.length,
        organizationId,
        brandId: brandId || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(&quot;[API] Error retrieving brand agents:&quot;, error);

    return NextResponse.json(
      {
        error: &quot;Failed to retrieve brand agents&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/roster/brand-agents
 *
 * Assign an agent to a brand with specified role and territories
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    const body = await request.json();

    console.log(`[API] Creating brand agent assignment`, {
      agentId: body.userId,
      brandId: body.brandId,
      role: body.assignmentRole,
      timestamp: new Date().toISOString(),
    });

    let validatedAssignment;
    try {
      validatedAssignment = validateBrandAgentAssignment({
        ...body,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      });
    } catch (validationError) {
      return NextResponse.json(
        {
          error: &quot;Invalid assignment data&quot;,
          details:
            validationError instanceof Error
              ? validationError.message
              : &quot;Validation failed&quot;,
        },
        { status: 400 },
      );
    }

    // Use service layer: Staff Assignment Service with event publishing
    const eventBus = new EventBusService();

    // Create real assignment through service layer
    const assignment = await rosterService.createBrandAgentAssignment({
      ...validatedAssignment,
      assignedBy: session.user.id,
    });

    // Publish event using EventBusService
    await eventBus.publish({
      id: uuidv4(),
      type: &quot;staff.assignment.created&quot;,
      data: assignment,
      timestamp: new Date(),
      correlationId: uuidv4(),
      source: &quot;brand-agents-api&quot;,
      version: &quot;1.0&quot;,
    });

    return NextResponse.json(
      {
        success: true,
        data: assignment,
        message: &quot;Cannabis expert staff successfully assigned&quot;,
        meta: {
          assignmentId: assignment.id,
          timestamp: new Date().toISOString(),
          eventsPublished: [
            &quot;staff.assigned&quot;,
            &quot;cannabis.staff_assignment_created&quot;,
          ],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(&quot;[API] Error creating cannabis staff assignment:&quot;, error);

    if (error instanceof Error && error.message.includes(&quot;already assigned&quot;)) {
      return NextResponse.json(
        {
          error: &quot;Assignment conflict&quot;,
          details: error.message,
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes(&quot;not found&quot;) ||
        error.message.includes(&quot;not active&quot;))
    ) {
      return NextResponse.json(
        {
          error: &quot;Resource not found&quot;,
          details: error.message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: &quot;Failed to create cannabis staff assignment&quot;,
        details: error instanceof Error ? error.message : &quot;Unknown error&quot;,
      },
      { status: 500 },
    );
  }
}
