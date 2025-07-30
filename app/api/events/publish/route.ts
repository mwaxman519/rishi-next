/**
 * Event Publishing API
 * Allows authorized users to publish events through the hybrid event bus
 */

import { NextRequest, NextResponse } from 'next/server';
import { eventBusManager } from '../../../../services/infrastructure/messaging/eventBusManager';
import { getCurrentUser } from '../../../../lib/auth-server';
import { hasPermission } from '../../../../lib/permissions';
import { BaseEvent } from '../../../../services/infrastructure/messaging/eventTypes';

export const dynamic = &quot;force-dynamic&quot;;

interface PublishEventRequest {
  type: string;
  payload?: any;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
  options?: {
    localOnly?: boolean;
    redisOnly?: boolean;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Permission check - only internal admins can publish system events
    const canPublishEvents = await hasPermission(
      user.id, 
      'update:organizations', 
      user.currentOrganizationId || 'system'
    );

    if (!canPublishEvents) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body: PublishEventRequest = await request.json();

    // Validate required fields
    if (!body.type) {
      return NextResponse.json({ 
        error: 'Event type is required' 
      }, { status: 400 });
    }

    // Create event object
    const event: BaseEvent = {
      type: body.type,
      userId: body.userId || user.id,
      organizationId: body.organizationId || user.currentOrganizationId || 'system',
      timestamp: new Date(),
      correlationId: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...body.metadata,
        publishedBy: user.id,
        publishedVia: 'api',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ...(body.payload ? { payload: body.payload } : {})
      }
    };

    // Publish the event
    await eventBusManager.publish(event, body.options);

    return NextResponse.json({
      success: true,
      event: {
        type: event.type,
        correlationId: event.correlationId,
        timestamp: event.timestamp
      },
      publishedTo: {
        local: !body.options?.redisOnly,
        redis: !body.options?.localOnly
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Event publishing failed:', error);
    
    return NextResponse.json({
      error: 'Failed to publish event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}