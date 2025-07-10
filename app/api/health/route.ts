/**
 * Health Check API Route
 * Provides system health monitoring for Azure/Vercel health probes
 */

import { NextRequest, NextResponse } from 'next/server';
import { HealthMonitorService } from '@/services/HealthMonitorService';
import { ServiceRegistry } from '@/services/ServiceRegistry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Initialize service registry if not already initialized
    const serviceRegistry = ServiceRegistry.getInstance();
    if (!serviceRegistry.isInitialized()) {
      await serviceRegistry.initialize();
    }

    const healthMonitor = serviceRegistry.getService<HealthMonitorService>('healthMonitor');
    if (!healthMonitor) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Health monitoring service not available',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const checkName = searchParams.get('check');
    const format = searchParams.get('format') || 'json';

    // Get specific health check if requested
    if (checkName) {
      const healthCheck = await healthMonitor.getHealthCheck(checkName);
      if (!healthCheck) {
        return NextResponse.json(
          {
            error: `Health check '${checkName}' not found`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      const statusCode = healthCheck.status === 'healthy' ? 200 : 
                        healthCheck.status === 'degraded' ? 200 : 503;

      return NextResponse.json(healthCheck, { status: statusCode });
    }

    // Get system health
    const systemHealth = await healthMonitor.getSystemHealth();

    // Return appropriate status code
    const statusCode = systemHealth.status === 'healthy' ? 200 : 
                      systemHealth.status === 'degraded' ? 200 : 503;

    // Format response based on request
    if (format === 'simple') {
      return NextResponse.json(
        {
          status: systemHealth.status,
          timestamp: systemHealth.timestamp,
          uptime: systemHealth.uptime,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(systemHealth, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check service error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

// Support for HEAD requests (common for health checks)
export async function HEAD(request: NextRequest) {
  try {
    const serviceRegistry = ServiceRegistry.getInstance();
    if (!serviceRegistry.isInitialized()) {
      await serviceRegistry.initialize();
    }

    const healthMonitor = serviceRegistry.getService<HealthMonitorService>('healthMonitor');
    if (!healthMonitor) {
      return new NextResponse(null, { status: 503 });
    }

    const systemHealth = await healthMonitor.getSystemHealth();
    const statusCode = systemHealth.status === 'healthy' ? 200 : 
                      systemHealth.status === 'degraded' ? 200 : 503;

    return new NextResponse(null, { status: statusCode });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}