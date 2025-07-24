/**
 * Brand Agents API Endpoints
 *
 * RESTful API for managing brand agent assignments with comprehensive
 * validation, error handling, and audit trail integration.
 *
 * @author Rishi Platform Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth-options";
import { EventBusService } from "../../../../services/event-bus-service";
import { rosterService } from "../../../services/roster/RosterService";
import { validateBrandAgentAssignment } from "../../../services/roster/types";

/**
 * GET /api/roster/brand-agents
 *
 * Retrieve brand agents for an organization with optional brand filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = (searchParams.get("organizationId") || undefined);
    const brandId = (searchParams.get("brandId") || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
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
    console.error("[API] Error retrieving brand agents:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve brand agents",
        details: error instanceof Error ? error.message : "Unknown error",
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          error: "Invalid assignment data",
          details:
            validationError instanceof Error
              ? validationError.message
              : "Validation failed",
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
      type: "staff.assignment.created",
      data: assignment,
      timestamp: new Date(),
      correlationId: uuidv4(),
      source: "brand-agents-api",
      version: "1.0",
    });

    return NextResponse.json(
      {
        success: true,
        data: assignment,
        message: "Cannabis expert staff successfully assigned",
        meta: {
          assignmentId: assignment.id,
          timestamp: new Date().toISOString(),
          eventsPublished: [
            "staff.assigned",
            "cannabis.staff_assignment_created",
          ],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API] Error creating cannabis staff assignment:", error);

    if (error instanceof Error && error.message.includes("already assigned")) {
      return NextResponse.json(
        {
          error: "Assignment conflict",
          details: error.message,
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("not active"))
    ) {
      return NextResponse.json(
        {
          error: "Resource not found",
          details: error.message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create cannabis staff assignment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
