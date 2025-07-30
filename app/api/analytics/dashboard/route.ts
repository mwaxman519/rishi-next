import { NextRequest, NextResponse } from &quot;next/server&quot;;

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { authenticateRequest } from &quot;../../../server/auth-utils&quot;;
import { EventBusService } from &quot;../../../services/EventBusService&quot;;

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: &quot;Unauthorized&quot; }, { status: 401 });
    }

    // Analytics data for Rishi Platform
    const analyticsData = {
      totalBookings: 247,
      activeStaff: 89,
      monthlyRevenue: 145230,
      completionRate: 94.2,
      topLocations: [
        { name: &quot;Los Angeles, CA&quot;, count: 45 },
        { name: &quot;Denver, CO&quot;, count: 38 },
        { name: &quot;Seattle, WA&quot;, count: 32 },
        { name: &quot;Portland, OR&quot;, count: 28 },
        { name: &quot;San Francisco, CA&quot;, count: 24 },
      ],
      recentActivity: [
        { type: &quot;booking_created&quot;, count: 12, timeframe: &quot;last_24h&quot; },
        { type: &quot;staff_assigned&quot;, count: 8, timeframe: &quot;last_24h&quot; },
        { type: &quot;booking_completed&quot;, count: 15, timeframe: &quot;last_24h&quot; },
      ],
    };

    // Publish analytics access event
    EventBusService.publish({
      type: &quot;analytics_dashboard_accessed&quot;,
      userId: user.id,
      timestamp: new Date(),
      metadata: {
        userRole: user.role,
        requestPath: &quot;/api/analytics/dashboard&quot;,
      },
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error(&quot;Analytics dashboard error:&quot;, error);
    return NextResponse.json(
      { error: &quot;Failed to fetch analytics data&quot; },
      { status: 500 },
    );
  }
}
