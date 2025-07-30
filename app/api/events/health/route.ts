/**
 * Event Bus Health Check API
 * Monitors the health of both local and Redis event systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridEventBus } from '../../../../services/infrastructure/messaging/hybridEventBus';

export const dynamic = &quot;force-dynamic&quot;;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get comprehensive event bus statistics
    const stats = await hybridEventBus.getStats();
    
    // Calculate health score
    const isHealthy = stats.mode === 'local-only' || 
                     (stats.redisHealth?.connected ?? false);
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      mode: stats.mode,
      timestamp: new Date().toISOString(),
      local: {
        subscriptions: stats.local,
        totalSubscriptions: Object.values(stats.local).reduce((sum, count) => sum + count, 0)
      },
      redis: stats.redis ? {
        subscriptions: stats.redis,
        totalSubscriptions: Object.values(stats.redis).reduce((sum, count) => sum + count, 0),
        health: stats.redisHealth
      } : null,
      capabilities: {
        crossServiceEvents: stats.mode === 'hybrid',
        persistentHistory: stats.redisHealth?.connected ?? false,
        fallbackMode: stats.mode === 'local-only'
      }
    };

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 206, // 206 = Partial Content for degraded mode
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Event bus health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}