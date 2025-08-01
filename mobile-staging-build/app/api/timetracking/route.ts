import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { EventBusService } from "../../../services/event-bus-service";
import { simpleTimeTrackingService } from "../../services/timetracking/SimpleTimeTrackingService";
import { z } from "zod";

// Use the exported instance
const timeTrackingService = simpleTimeTrackingService;

// Service is now ready for real data operations

// GET /api/timetracking - Get time entries with filtering
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as any;

    const { searchParams } = new URL(request.url);

    const organizationId = (searchParams.get("organizationId") || undefined);
    const agentId = (searchParams.get("agentId") || undefined) || undefined;
    const shiftId = (searchParams.get("shiftId") || undefined) || undefined;
    const startDate = (searchParams.get("startDate") || undefined);
    const endDate = (searchParams.get("endDate") || undefined);
    const status = (searchParams.get("status") || undefined);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Role-based access control
    let effectiveAgentId = agentId;
    if (user.role === "brand_agent") {
      // Brand agents can only see their own time entries
      effectiveAgentId = user.id;
    } else if (user.role === "field_manager" || user.role === "client_user") {
      // Field managers and client users can see all time entries for their organization
      // effectiveAgentId remains as provided (can be undefined for all org users)
      effectiveAgentId = agentId;
    } else if (user.role === "internal_admin" || user.role === "super_admin") {
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
        ...(status && status !== "all" && { status }),
      },
    );

    return NextResponse.json({
      success: true,
      data: timeEntries,
    });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch time entries",
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

    if (action === "clock-in") {
      // Get authenticated user from session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      if (user.role === "brand_agent") {
        // Brand agents can only clock in for themselves
        effectiveAgentId = user.id;
      } else if (user.role === "field_manager" || user.role === "client_user") {
        // Field managers and client users can clock in for agents in their organization
        // In production, verify the agent belongs to the same organization
        effectiveAgentId = validatedData.agentId;
      } else if (
        user.role === "internal_admin" ||
        user.role === "super_admin"
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
        message: "Clocked in successfully",
      });
    }

    if (action === "clock-out") {
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

      console.log("DEVELOPMENT MODE: Using mock user for testing");
      const user = { id: "mock-user-id", role: "brand_agent" }; // In production, get from session

      const validatedData = clockOutSchema.parse(data);

      // Role-based access control for clock-out operations
      let agentId;
      if (user.role === "brand_agent") {
        // Brand agents can only clock out for themselves
        agentId = user.id;
      } else if (user.role === "field_manager" || user.role === "client_user") {
        // Field managers and client users can clock out for agents in their organization
        // In production, verify the agent belongs to the same organization
        agentId = user.id; // For demo, use current user
      } else if (
        user.role === "internal_admin" ||
        user.role === "super_admin"
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
        message: "Clocked out successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'clock-in' or 'clock-out'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error processing time tracking action:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
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
            : "Time tracking operation failed",
      },
      { status: 500 },
    );
  }
}
