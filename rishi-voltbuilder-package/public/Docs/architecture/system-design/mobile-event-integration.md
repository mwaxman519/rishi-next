# Mobile and Event System Integration

## Overview

This document details how our mobile architecture integrates with our event-driven architecture to provide a seamless experience across online and offline environments. This architecture allows field agents to work effectively in areas with poor or no connectivity while ensuring that all data and events are properly synchronized when connectivity is restored.

## Key Integration Challenges

Integrating mobile applications with an event-driven architecture presents several unique challenges:

1. **Intermittent Connectivity**: Mobile devices may frequently transition between online and offline states
2. **Event Ordering**: Maintaining correct event sequence when batches of events are synchronized
3. **Conflict Resolution**: Handling conflicts between mobile-generated events and server events
4. **Bandwidth Limitations**: Efficiently synchronizing events over limited mobile networks
5. **Battery Considerations**: Balancing event synchronization with device battery preservation

## Architectural Integration

### System Architecture Diagram

```
┌───────────────────────────────────┐         ┌───────────────────────────────────┐
│                                   │         │                                   │
│         Mobile Application        │         │          Backend Services         │
│                                   │         │                                   │
├───────────────────────────────────┤         ├───────────────────────────────────┤
│                                   │         │                                   │
│  ┌─────────────┐  ┌─────────────┐ │         │ ┌─────────────┐  ┌─────────────┐  │
│  │ Local Event │  │  WatermelonDB│ │         │ │ Event Bus  │  │  Neon DB    │  │
│  │  Queue      │◄─┤    Models   │ │         │ │ (HybridBus) │◄─┤   Models    │  │
│  └──────┬──────┘  └─────────────┘ │         │ └──────┬──────┘  └─────────────┘  │
│         │                         │         │        │                          │
│  ┌──────▼──────┐                  │ Sync    │ ┌──────▼──────┐                   │
│  │ Sync Service│◄─────────────────┼─────────┼─┤API Gateway  │                   │
│  └─────────────┘                  │         │ └─────────────┘                   │
│                                   │         │                                   │
└───────────────────────────────────┘         └───────────────────────────────────┘
```

### Integration Components

1. **Mobile Event Queue**

   - Captures and stores events generated on the mobile device while offline
   - Maintains event ordering with local timestamps
   - Prioritizes events based on business importance
   - Handles retry logic for failed event synchronization

2. **Mobile Sync Service**

   - Orchestrates bidirectional synchronization between mobile and backend
   - Implements smart bandwidth usage based on connection quality
   - Handles background synchronization when app is not active
   - Provides sync status and progress to the user interface

3. **Backend Event API Gateway**

   - Receives batches of events from mobile devices
   - Validates event schema and security context
   - Routes events to the appropriate event handlers
   - Returns event processing results and conflicts to mobile devices

4. **Backend Hybrid Event Bus**
   - Processes events from both web and mobile clients
   - Maintains a consistent event handling approach across platforms
   - Routes events to the appropriate service implementations
   - Ensures event handlers are idempotent for reliable processing

## Event Synchronization Process

### Offline Event Generation

1. User performs an action on the mobile device while offline
2. Action generates local events that are stored in the Mobile Event Queue
3. Local event handlers process the events for immediate local state updates
4. WatermelonDB stores the resulting data changes with sync metadata

### Event Synchronization

When connectivity is restored, the following process occurs:

1. **Connection Detection**

   - Network availability is detected by the device
   - Sync Service evaluates connection quality and bandwidth

2. **Sync Initialization**

   - Sync Service establishes secure connection with backend
   - Authentication tokens are validated or refreshed

3. **Event Upload (Mobile to Backend)**

   - Batches of events are sent from the Mobile Event Queue to the Backend
   - Events are ordered by timestamp and priority
   - API Gateway processes events and returns results

4. **Event Download (Backend to Mobile)**

   - New events that occurred on the backend are sent to the mobile device
   - Events include all relevant data needed for local processing
   - Local event handlers process downloaded events

5. **Conflict Resolution**

   - Conflicts between local and server events are identified
   - Resolution strategies are applied based on entity type and business rules
   - User input may be requested for manual resolution of complex conflicts

6. **Completion and Verification**
   - Checksums and version markers confirm successful synchronization
   - Successfully processed events are removed from the Mobile Event Queue
   - Sync status is updated in the user interface

## Event Schema Compatibility

To ensure compatibility between mobile and backend events:

1. **Shared Type Definitions**

   - Event types and payloads are defined in shared TypeScript interfaces
   - Validation schemas are shared between mobile and backend
   - Type-safe event generation and processing on both platforms

2. **Schema Versioning Strategy**

   - Events include schema version in metadata
   - Backward compatibility maintained for at least one major version
   - Migration logic for handling deprecated event formats

3. **Payload Optimization**
   - Mobile events use compressed formats for efficient transmission
   - Large binary data (images, etc.) are handled through separate upload channels
   - Selective field synchronization for bandwidth efficiency

## Implementation Examples

### Mobile Event Generation Example

```typescript
// In mobile app time tracking feature
async function recordTimeEntry(entryData: TimeEntryData): Promise<void> {
  try {
    // Create record in local database
    const timeEntry = await database
      .get<TimeEntry>("time_entries")
      .create((record) => {
        record.startTime = entryData.startTime;
        record.endTime = entryData.endTime;
        record.shiftId = entryData.shiftId;
        record.notes = entryData.notes;
        record.locationData = entryData.locationData;
        record._status = "created";
        record._changed = new Date().toISOString();
      });

    // Generate local event
    await mobileEventQueue.enqueue({
      type: "time_entry.created",
      payload: {
        id: timeEntry.id,
        startTime: entryData.startTime,
        endTime: entryData.endTime,
        shiftId: entryData.shiftId,
        notes: entryData.notes,
        locationData: entryData.locationData,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        deviceId: deviceInfo.getUniqueId(),
        connectionStatus: "offline",
        schemaVersion: "1.0",
      },
      priority: "high",
    });

    // Update UI immediately (optimistic update)
    dispatch({ type: "ADD_TIME_ENTRY", payload: timeEntry });
  } catch (error) {
    // Handle error and notify user
  }
}
```

### Mobile Event Sync Example

```typescript
// In mobile sync service
async function synchronizeEvents(): Promise<SyncResult> {
  try {
    // Check if we have events to sync
    const pendingEvents = await mobileEventQueue.getPendingEvents();
    if (pendingEvents.length === 0) {
      return { success: true, syncedEvents: 0 };
    }

    // Group events in optimally-sized batches
    const eventBatches = createEventBatches(
      pendingEvents,
      getOptimalBatchSize(),
    );

    let syncedCount = 0;
    let failedCount = 0;
    let conflicts = [];

    // Process each batch
    for (const batch of eventBatches) {
      try {
        // Send batch to server
        const result = await apiClient.post("/api/events/batch", {
          events: batch,
          deviceInfo: {
            deviceId: deviceInfo.getUniqueId(),
            appVersion: deviceInfo.getVersion(),
            lastSyncTimestamp: await getSyncTimestamp(),
          },
        });

        // Process results
        if (result.success) {
          // Mark events as processed
          await mobileEventQueue.markAsProcessed(batch.map((e) => e.id));
          syncedCount += batch.length;

          // Store any conflicts for resolution
          if (result.conflicts && result.conflicts.length > 0) {
            conflicts = [...conflicts, ...result.conflicts];
          }
        } else {
          failedCount += batch.length;
          // Handle batch failure - will be retried on next sync
        }
      } catch (error) {
        // Handle network or server errors
        failedCount += batch.length;
        if (!isRetryableError(error)) {
          await mobileEventQueue.markAsFailed(
            batch.map((e) => e.id),
            error.message,
          );
        }
      }
    }

    // Handle conflicts if any
    if (conflicts.length > 0) {
      await conflictResolutionService.resolveConflicts(conflicts);
    }

    // Update last sync timestamp
    await saveSyncTimestamp(new Date().toISOString());

    return {
      success: failedCount === 0,
      syncedEvents: syncedCount,
      failedEvents: failedCount,
      conflicts: conflicts.length,
    };
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### Backend Event Processing Example

```typescript
// In backend API route
export async function POST(request: Request) {
  try {
    const { events, deviceInfo } = await request.json();

    // Validate request
    if (!events || !Array.isArray(events) || !deviceInfo) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // Process each event in the batch
    const results = [];
    const conflicts = [];

    for (const event of events) {
      try {
        // Validate event schema based on type and version
        validateEventSchema(event);

        // Check for conflicts
        const conflict = await checkForConflict(event);
        if (conflict) {
          conflicts.push({
            eventId: event.id,
            conflictType: conflict.type,
            serverEvent: conflict.serverEvent,
            resolutionStrategy: conflict.resolutionStrategy,
          });

          // Apply conflict resolution if automatic
          if (conflict.resolutionStrategy !== "manual") {
            await applyConflictResolution(event, conflict);
          }
          continue;
        }

        // Process event with the hybrid event bus
        await hybridEventBus.publish(event.type, event.payload);

        results.push({
          eventId: event.id,
          status: "processed",
        });
      } catch (error) {
        results.push({
          eventId: event.id,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Return batch processing results
    return NextResponse.json({
      success: true,
      results,
      conflicts,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Performance Considerations

1. **Batch Processing**

   - Events are processed in batches for network efficiency
   - Batch size is dynamically adjusted based on connection quality
   - Critical events may be processed individually for immediate consistency

2. **Background Synchronization**

   - Events are synchronized in the background when possible
   - Scheduling based on connectivity, battery level, and data plan
   - Exponential backoff for retry attempts during poor connectivity

3. **Incremental Synchronization**
   - Only changed data and new events are synchronized
   - Timestamps and version markers enable efficient delta updates
   - Prioritization of business-critical events

## Security Considerations

1. **Authentication and Authorization**

   - All event synchronization requires valid authentication tokens
   - Token refresh handled automatically during synchronization
   - Event authorization rules applied consistently on mobile and backend

2. **Data Protection**

   - Sensitive event payloads are encrypted at rest on mobile devices
   - TLS encryption for all data in transit
   - Event data purged from queue after successful processing

3. **Audit and Compliance**
   - Event provenance tracking (device ID, user, timestamp)
   - Complete event history for compliance requirements
   - Tamper-evident event logs with cryptographic verification

## Testing Strategy

Testing the integrated event system between mobile and backend requires specialized approaches:

1. **Offline Scenario Testing**

   - Simulated connectivity loss during various operations
   - Extended offline periods with significant local changes
   - Intermittent connectivity with partial synchronization

2. **Conflict Simulation**

   - Forced conflicts between mobile and server events
   - Testing of all conflict resolution strategies
   - Edge cases with multiple conflicting changes

3. **Performance Testing**

   - Large event batch synchronization
   - Bandwidth-constrained environments
   - Battery impact measurement

4. **Security Testing**
   - Authentication token expiry during synchronization
   - Unauthorized event submission attempts
   - Data leakage prevention

## Current Status and Future Enhancements

### Current Implementation Status (March 2025)

- ✅ Core event synchronization architecture implemented
- ✅ Offline event generation and queuing functioning
- ✅ Batch event processing with conflict resolution
- ✅ Background synchronization with network awareness
- 🔄 Advanced conflict visualization UI in progress
- 🔄 Performance optimization for large event batches ongoing

### Planned Enhancements (2025-2026)

1. **Enhanced Event Prioritization**

   - Machine learning-based prioritization based on user patterns
   - Contextual importance assessment for events
   - Dynamic adjustment based on business processes

2. **Cross-Device Event Coordination**

   - Peer-to-peer event sharing between field team devices
   - Conflict resolution across multiple offline devices
   - Local event mesh for field teams working together

3. **Edge Computing Integration**
   - Process complex events at the edge when possible
   - Reduced backend dependency for common operations
   - Intelligent workload distribution between device and cloud

## Conclusion

The integration between our mobile architecture and event-driven backend provides a robust foundation for offline-capable applications. By implementing a sophisticated event queue and synchronization system, we enable field operations to continue seamlessly regardless of connectivity status, while ensuring data consistency and event processing integrity when connectivity is restored.

This architecture delivers significant business value by eliminating connectivity constraints for field operations while maintaining the benefits of a centralized event-driven system for business process management and data integrity.

## Tags

[mobile, events, offline, synchronization, architecture, integration]
