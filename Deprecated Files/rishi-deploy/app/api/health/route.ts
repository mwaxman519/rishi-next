// Production Health Check API Endpoints
// Provides comprehensive health monitoring for microservices deployment

import { NextRequest, NextResponse } from "next/server";
import { HealthMonitorService } from "../../../services/health-monitor";

// GET /api/health - Comprehensive health check
export async function GET(request: NextRequest) {
  try {
    const healthMonitor = HealthMonitorService.getInstance();
    const systemHealth = await healthMonitor.getSystemHealth();

    const statusCode = systemHealth.status === "unhealthy" ? 503 : 200;

    return NextResponse.json(systemHealth, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check service unavailable",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  }
}

// GET /api/health/ready - Kubernetes readiness probe
export async function ready(request: NextRequest) {
  try {
    const healthMonitor = HealthMonitorService.getInstance();
    const isReady = await healthMonitor.isReady();

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

// GET /api/health/live - Kubernetes liveness probe
export async function live(request: NextRequest) {
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
