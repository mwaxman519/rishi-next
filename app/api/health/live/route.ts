// Kubernetes Liveness Probe Endpoint

export const dynamic = &quot;force-static&quot;;
export const revalidate = false;

import { NextRequest, NextResponse } from &quot;next/server&quot;;
import { HealthMonitorService } from &quot;../../../../services/health-monitor&quot;;

export async function GET(request: NextRequest) {
  try {
    const healthMonitor = HealthMonitorService.getInstance();
    const isAlive = healthMonitor.isAlive();

    return NextResponse.json(
      { status: isAlive ? &quot;alive&quot; : &quot;dead&quot; },
      {
        status: isAlive ? 200 : 503,
      },
    );
  } catch (error) {
    return NextResponse.json({ status: &quot;dead&quot; }, { status: 503 });
  }
}
