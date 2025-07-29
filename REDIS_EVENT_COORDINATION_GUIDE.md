# Redis Event Coordination Implementation Guide

## Overview

The Rishi Platform now includes **Redis-based distributed event coordination** that enables real-time synchronization across multiple server instances, persistent event storage, and scalable mobile app coordination.

## Architecture Components

### 1. HybridEventBus (`services/infrastructure/messaging/hybridEventBus.ts`)
- **Primary Event System**: Combines local in-memory events with Redis pub/sub
- **Graceful Fallback**: Automatically switches to local-only when Redis unavailable
- **Dual Channel Publishing**: Events published to both local subscribers and Redis channels
- **Health Monitoring**: Continuous Redis health checks with automatic reconnection

### 2. RedisEventBus (`services/infrastructure/messaging/redisEventBus.ts`)
- **Redis Pub/Sub Integration**: Full Redis client with dedicated publisher/subscriber connections
- **Event Persistence**: Stores event history in Redis with configurable TTL (default 1 hour)
- **Connection Management**: Exponential backoff retry logic with max retry limits
- **Correlation Tracking**: Event correlation IDs for distributed tracing

### 3. EventBusManager (`services/infrastructure/messaging/eventBusManager.ts`)
- **Singleton Management**: Centralized access point for all event operations
- **System Events**: Publishes initialization, shutdown, and system status events
- **Statistics & Health**: Comprehensive system monitoring and health reporting
- **Auto-Initialization**: Automatic setup in production environments

## Configuration

### Environment Variables

```bash
# Enable Redis integration (default: false)
ENABLE_REDIS_EVENTS=true

# Redis connection (choose one method)
# Method 1: Full URL
REDIS_URL=redis://localhost:6379

# Method 2: Individual components
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Optional: Service identification
SERVICE_NAME=rishi-platform
```

### Production Setup

1. **Vercel Deployment**:
   - Set `ENABLE_REDIS_EVENTS=true` in Vercel environment variables
   - Configure `REDIS_URL` or individual Redis connection parameters
   - Redis service: Use Redis Cloud, AWS ElastiCache, or similar

2. **VoltBuilder Mobile Apps**:
   - Mobile apps connect to Vercel backend endpoints
   - Events automatically coordinated through Redis
   - Real-time mobile synchronization enabled

3. **Multiple Server Instances**:
   - Each instance automatically joins Redis event coordination
   - Events published on one instance received by all instances
   - Persistent event history shared across all instances

## API Endpoints

### Health Check
```bash
GET /api/events/health
# Returns: event bus status, Redis health, subscription counts
```

### Event History
```bash
GET /api/events/history?eventType=booking.created&limit=50&source=redis
# Returns: historical events from local memory and/or Redis
```

### Event Publishing
```bash
POST /api/events/publish
Content-Type: application/json

{
  "type": "custom.event",
  "payload": { "data": "example" },
  "options": {
    "localOnly": false,
    "redisOnly": false
  }
}
```

## Usage Examples

### Publishing Events
```typescript
import { eventBusManager } from '@/services/infrastructure/messaging/eventBusManager';

// Publish to both local and Redis
await eventBusManager.publish({
  type: 'booking.created',
  userId: 'user123',
  organizationId: 'org456',
  timestamp: new Date(),
  correlationId: 'booking_789',
  metadata: { bookingId: '789', status: 'confirmed' }
});

// Publish Redis-only (for cross-service coordination)
await eventBusManager.publish(event, { redisOnly: true });
```

### Subscribing to Events
```typescript
import { eventBusManager } from '@/services/infrastructure/messaging/eventBusManager';

// Subscribe to events across all channels
const subscriptionIds = await eventBusManager.subscribe(
  'booking.created',
  async (event) => {
    console.log('Booking created:', event.metadata.bookingId);
    // Handle booking creation...
  }
);

// Subscribe to local events only
const localIds = await eventBusManager.subscribe(
  'user.login',
  handleUserLogin,
  { localOnly: true }
);
```

### Health Monitoring
```typescript
import { eventBusManager } from '@/services/infrastructure/messaging/eventBusManager';

// Get comprehensive system statistics
const stats = await eventBusManager.getSystemStats();
console.log('Event bus mode:', stats.stats.mode);
console.log('Redis connected:', stats.stats.redisHealth?.connected);

// Health check
const health = await eventBusManager.healthCheck();
console.log('System status:', health.status);
```

## Production Benefits

### 1. **Multi-Instance Coordination**
- Events published on any server instance received by all instances
- Consistent state synchronization across horizontal scaling
- Load balancer-friendly architecture

### 2. **Mobile App Real-Time Sync**
- Mobile apps receive real-time updates through API endpoints
- Backend state changes immediately available to mobile clients
- Offline/online synchronization support

### 3. **Event Persistence**
- Events survive server restarts and deployments
- Historical event analysis and debugging capabilities
- Configurable event retention policies

### 4. **Fault Tolerance**
- Graceful degradation when Redis unavailable
- Automatic reconnection and health monitoring
- Local fallback ensures zero downtime

## Monitoring & Debugging

### Event Bus Health Dashboard
Access the health endpoint to monitor:
- Redis connection status and latency
- Active subscription counts (local + Redis)
- Event publishing statistics
- System mode (local-only, hybrid, redis-only)

### Event History Analysis
Query event history for:
- Debugging event flow issues
- Performance analysis
- System behavior monitoring
- Cross-service communication tracking

### Correlation ID Tracking
- Every event includes a unique correlation ID
- Trace events across services and instances
- Debug distributed system behaviors

## Migration from Local-Only Events

The system is **backwards compatible**:
1. Existing local event code continues working unchanged
2. Redis integration adds distributed capabilities on top
3. No breaking changes to existing event handlers
4. Gradual migration to Redis-coordinated events as needed

## Security Considerations

- Redis authentication via `REDIS_PASSWORD`
- Event publishing requires proper user permissions
- Event history access restricted to internal admins
- All events include publisher identification and timestamps

This implementation provides enterprise-grade distributed event coordination while maintaining the simplicity and reliability of the existing local event system.