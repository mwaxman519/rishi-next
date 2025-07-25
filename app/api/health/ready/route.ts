// Kubernetes Readiness Probe Endpoint

export const dynamic = "force-static";
export const revalidate = false;

import { NextRequest, NextResponse } from "next/server";
import { HealthMonitorService } from "../../../../services/health-monitor";

export async function GET(request: NextRequest) {
  try {
    const healthMonitor = new HealthMonitorService();
    const result = await healthMonitor.isReady();
    const isReady = result.ready;

    if (isReady) {
      return NextResponse.json({ status: "ready" }, { status: 200 });
    } else {
      return NextResponse.json({ status: "not ready" }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json(
      { status: "not ready", error: "Health check failed" },
      { status: 503 },
    );
  }
}
