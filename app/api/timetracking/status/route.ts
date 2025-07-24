import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { simpleTimeTrackingService } from "../../../services/timetracking/SimpleTimeTrackingService";

// Use the exported instance
const timeTrackingService = simpleTimeTrackingService;

// GET /api/timetracking/status - Get agent clock status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = (searchParams.get("agentId") || undefined);

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 },
      );
    }

    const status = await timeTrackingService.getAgentStatus(agentId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting agent status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get agent status",
      },
      { status: 500 },
    );
  }
}
