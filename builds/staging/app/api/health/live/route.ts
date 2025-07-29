// Kubernetes Liveness Probe Endpoint

export const dynamic = "force-static";
export const revalidate = false;

import { NextRequest, NextResponse } from "next/server";
import { HealthMonitorService } from "../../../../services/health-monitor";

export async function GET(request: NextRequest) {
  try {
    const healthMonitor = HealthMonitorService.getInstance();
    const isAlive = healthMonitor.isAlive();

    return NextResponse.json(
      { status: isAlive ? "alive" : "dead" },
      {
        status: isAlive ? 200 : 503,
      },
    );
  } catch (error) {
    return NextResponse.json({ status: "dead" }, { status: 503 });
  }
}
