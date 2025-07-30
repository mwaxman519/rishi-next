import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &quot;@/lib/auth-options&quot;;
import { EventBusService } from &quot;../../../services/event-bus-service&quot;;

export async function GET(request: NextRequest) {
  try {
    // Simple notification endpoint using Next.js API routes
    return NextResponse.json({
      notifications: [],
      connected: true,
      status: &quot;ok&quot;,
    });
  } catch (error) {
    return NextResponse.json(
      { error: &quot;Failed to fetch notifications&quot; },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle notification subscription via API route
    return NextResponse.json({
      success: true,
      subscribed: body.events || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: &quot;Failed to subscribe to notifications&quot; },
      { status: 500 },
    );
  }
}
