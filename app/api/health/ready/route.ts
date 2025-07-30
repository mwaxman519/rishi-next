// Kubernetes Readiness Probe Endpoint

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { HealthMonitorService } from &quot;../../../../services/health-monitor&quot;;

export async function GET(request: NextRequest) {
  try {
    const healthMonitor = HealthMonitorService.getInstance();
    const isReady = await healthMonitor.isReady();

    if (isReady) {
      return NextResponse.json({ status: &quot;ready&quot; }, { status: 200 });
    } else {
      return NextResponse.json({ status: &quot;not ready&quot; }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json(
      { status: &quot;not ready&quot;, error: &quot;Health check failed&quot; },
      { status: 503 },
    );
  }
}
