import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { simpleTimeTrackingService } from &quot;../../../services/timetracking/SimpleTimeTrackingService&quot;;

// Use the exported instance
const timeTrackingService = simpleTimeTrackingService;

// GET /api/timetracking/status - Get agent clock status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = (searchParams.get(&quot;agentId&quot;) || undefined);

    if (!agentId) {
      return NextResponse.json(
        { error: &quot;Agent ID is required&quot; },
        { status: 400 },
      );
    }

    const status = await timeTrackingService.getAgentStatus(agentId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error(&quot;Error getting agent status:&quot;, error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : &quot;Failed to get agent status&quot;,
      },
      { status: 500 },
    );
  }
}
