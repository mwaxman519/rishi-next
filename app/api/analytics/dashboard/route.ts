import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = false;

import { authenticateRequest } from "../../../server/auth-utils";
import { EventBusService } from "../../../services/EventBusService";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Analytics data for Rishi Platform
    const analyticsData = {
      totalBookings: 247,
      activeStaff: 89,
      monthlyRevenue: 145230,
      completionRate: 94.2,
      topLocations: [
        { name: "Los Angeles, CA", count: 45 },
        { name: "Denver, CO", count: 38 },
        { name: "Seattle, WA", count: 32 },
        { name: "Portland, OR", count: 28 },
        { name: "San Francisco, CA", count: 24 },
      ],
      recentActivity: [
        { type: "booking_created", count: 12, timeframe: "last_24h" },
        { type: "staff_assigned", count: 8, timeframe: "last_24h" },
        { type: "booking_completed", count: 15, timeframe: "last_24h" },
      ],
    };

    // Publish analytics access event
    EventBusService.publish({
      type: "analytics_dashboard_accessed",
      userId: user.id,
      timestamp: new Date(),
      metadata: {
        userRole: user.role,
        requestPath: "/api/analytics/dashboard",
      },
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
