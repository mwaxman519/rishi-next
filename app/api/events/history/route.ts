/**
 * Event History API
 * Retrieves event history from both local and Redis sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridEventBus } from '../../../../services/infrastructure/messaging/hybridEventBus';
import { getCurrentUser } from '../../../../lib/auth-server';
import { hasPermission } from '../../../../lib/permissions';

export const dynamic = &quot;force-dynamic&quot;;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - only internal admins can view event history
    const canViewEvents = await hasPermission(
      user.id, 
      'read:organizations', 
      user.currentOrganizationId || 'system'
    );

    if (!canViewEvents) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const source = (searchParams.get('source') as 'local' | 'redis' | 'both') || 'both';

    // Validate parameters
    if (limit > 1000) {
      return NextResponse.json({ 
        error: 'Limit cannot exceed 1000 events' 
      }, { status: 400 });
    }

    // Get event history
    const events = await hybridEventBus.getEventHistory(eventType, limit, source);
    
    // Get current stats for context
    const stats = await hybridEventBus.getStats();

    const response = {
      events,
      metadata: {
        totalReturned: events.length,
        limit,
        eventType,
        source,
        timestamp: new Date().toISOString(),
        eventBusMode: stats.mode,
        redisAvailable: stats.redisHealth?.connected ?? false
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Event history retrieval failed:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve event history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}