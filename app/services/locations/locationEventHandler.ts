/**
 * Location Event Handler Service
 *
 * Handles incoming location events such as:
 * - Location approval/rejection (send notifications)
 * - Location creation/update (update search index)
 * - Location deletion (cleanup resources)
 */

import {
  AppEvent,
  Event,
  LocationCreatedPayload,
  LocationUpdatedPayload,
  LocationApprovalPayload,
  LocationRejectionPayload,
  LocationDeletedPayload,
} from &quot;../infrastructure/messaging/eventTypes&quot;;
import { EventSubscriber } from &quot;../infrastructure/messaging/distributedEventBus&quot;;
import { db } from &quot;../../lib/db&quot;;
import { notificationService } from &quot;../notifications/notificationService&quot;;

/**
 * LocationEventHandler
 *
 * Manages response to location-related events across the system
 */
export class LocationEventHandler implements EventSubscriber {
  constructor() {
    // Dependencies are injected through imports
  }

  /**
   * Returns the list of events this handler subscribes to
   */
  getSubscribedEvents(): AppEvent[] {
    return [
      AppEvent.LOCATION_CREATED,
      AppEvent.LOCATION_UPDATED,
      AppEvent.LOCATION_APPROVED,
      AppEvent.LOCATION_REJECTED,
      AppEvent.LOCATION_DELETED,
    ];
  }

  /**
   * Handle incoming events
   */
  async handleEvent<T>(event: Event<T>): Promise<void> {
    console.log(`[LocationEventHandler] Handling event: ${event.type}`, {
      eventId: event.id,
    });

    try {
      switch (event.type) {
        case AppEvent.LOCATION_CREATED:
          await this.handleLocationCreated(
            event as Event<LocationCreatedPayload>,
          );
          break;
        case AppEvent.LOCATION_UPDATED:
          await this.handleLocationUpdated(
            event as Event<LocationUpdatedPayload>,
          );
          break;
        case AppEvent.LOCATION_APPROVED:
          await this.handleLocationApproved(
            event as Event<LocationApprovalPayload>,
          );
          break;
        case AppEvent.LOCATION_REJECTED:
          await this.handleLocationRejected(
            event as Event<LocationRejectionPayload>,
          );
          break;
        case AppEvent.LOCATION_DELETED:
          await this.handleLocationDeleted(
            event as Event<LocationDeletedPayload>,
          );
          break;
        default:
          console.warn(
            `[LocationEventHandler] Unhandled event type: ${event.type}`,
          );
      }
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling event ${event.type}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle location created event
   */
  private async handleLocationCreated(
    event: Event<LocationCreatedPayload>,
  ): Promise<void> {
    const payload = event.payload;
    console.log(
      `[LocationEventHandler] Processing location created event for location: ${payload.locationId}`,
    );

    try {
      // Log the event
      await this.logEvent(&quot;location_created&quot;, event.id, {
        locationId: payload.locationId,
        submittedById: payload.submittedById,
      });

      // Update search index with new location
      // await this.updateSearchIndex(payload.locationId);

      console.log(
        `[LocationEventHandler] Successfully processed location created event for location: ${payload.locationId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling location created event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle location updated event
   */
  private async handleLocationUpdated(
    event: Event<LocationUpdatedPayload>,
  ): Promise<void> {
    const payload = event.payload;
    console.log(
      `[LocationEventHandler] Processing location updated event for location: ${payload.locationId}`,
    );

    try {
      // Log the event
      await this.logEvent(&quot;location_updated&quot;, event.id, {
        locationId: payload.locationId,
        updatedById: payload.updatedById,
        changes: payload.changes,
      });

      // Update search index
      // await this.updateSearchIndex(payload.locationId);

      console.log(
        `[LocationEventHandler] Successfully processed location updated event for location: ${payload.locationId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling location updated event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle location approved event
   */
  private async handleLocationApproved(
    event: Event<LocationApprovalPayload>,
  ): Promise<void> {
    const payload = event.payload;
    console.log(
      `[LocationEventHandler] Processing location approved event for location: ${payload.locationId}`,
    );

    try {
      // Log the event
      await this.logEvent(&quot;location_approved&quot;, event.id, {
        locationId: payload.locationId,
        approvedById: payload.approvedById,
        submittedById: payload.submittedById,
      });

      // Send notification to the submitter
      if (payload.submittedById) {
        try {
          await this.sendApprovalNotification(
            payload.locationId,
            payload.name || &quot;Your location&quot;,
            payload.submittedById,
            payload.approvedByName,
          );
        } catch (notificationError) {
          console.error(
            `[LocationEventHandler] Error sending approval notification:`,
            notificationError,
          );
          // Continue processing even if notification fails
        }
      }

      // Update search index to make the location searchable
      // await this.updateSearchIndex(payload.locationId);

      console.log(
        `[LocationEventHandler] Successfully processed location approved event for location: ${payload.locationId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling location approved event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle location rejected event
   */
  private async handleLocationRejected(
    event: Event<LocationRejectionPayload>,
  ): Promise<void> {
    const payload = event.payload;
    console.log(
      `[LocationEventHandler] Processing location rejected event for location: ${payload.locationId}`,
    );

    try {
      // Log the event
      await this.logEvent(&quot;location_rejected&quot;, event.id, {
        locationId: payload.locationId,
        rejectedById: payload.rejectedById,
        submittedById: payload.submittedById,
        rejectionReason: payload.rejectionReason,
      });

      // Send notification to the submitter
      if (payload.submittedById) {
        try {
          await this.sendRejectionNotification(
            payload.locationId,
            payload.name || &quot;Your location&quot;,
            payload.submittedById,
            payload.rejectedByName,
            payload.rejectionReason,
          );
        } catch (notificationError) {
          console.error(
            `[LocationEventHandler] Error sending rejection notification:`,
            notificationError,
          );
          // Continue processing even if notification fails
        }
      }

      console.log(
        `[LocationEventHandler] Successfully processed location rejected event for location: ${payload.locationId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling location rejected event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle location deleted event
   */
  private async handleLocationDeleted(
    event: Event<LocationDeletedPayload>,
  ): Promise<void> {
    const payload = event.payload;
    console.log(
      `[LocationEventHandler] Processing location deleted event for location: ${payload.locationId}`,
    );

    try {
      // Log the event
      await this.logEvent(&quot;location_deleted&quot;, event.id, {
        locationId: payload.locationId,
        deletedById: payload.deletedById,
      });

      // Remove from search index
      // await this.removeFromSearchIndex(payload.locationId);

      // Clean up any resources associated with this location
      // await this.cleanupLocationResources(payload.locationId);

      console.log(
        `[LocationEventHandler] Successfully processed location deleted event for location: ${payload.locationId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Error handling location deleted event:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send notification for location approval
   */
  private async sendApprovalNotification(
    locationId: string,
    locationName: string,
    userId: string,
    approverName: string,
  ): Promise<void> {
    console.log(
      `[LocationEventHandler] Sending approval notification for location: ${locationId} to user: ${userId}`,
    );

    try {
      await notificationService.sendNotification({
        userId,
        title: &quot;Location Approved&quot;,
        message: `Your location &quot;${locationName}&quot; has been approved by ${approverName}.`,
        type: &quot;success&quot;,
        link: `/locations/${locationId}`,
        priority: &quot;medium&quot;,
        metadata: {
          locationId,
          eventType: &quot;location_approved&quot;,
          approverName,
        },
      });

      console.log(
        `[LocationEventHandler] Approval notification sent to user: ${userId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Failed to send approval notification:`,
        error,
      );
      // Don't rethrow to prevent event processing from failing
    }
  }

  /**
   * Send notification for location rejection
   */
  private async sendRejectionNotification(
    locationId: string,
    locationName: string,
    userId: string,
    rejectorName: string,
    rejectionReason?: string,
  ): Promise<void> {
    console.log(
      `[LocationEventHandler] Sending rejection notification for location: ${locationId} to user: ${userId}`,
    );

    const reason = rejectionReason
      ? `Reason: ${rejectionReason}`
      : &quot;No specific reason was provided.&quot;;

    try {
      await notificationService.sendNotification({
        userId,
        title: &quot;Location Rejected&quot;,
        message: `Your location &quot;${locationName}&quot; was not approved by ${rejectorName}. ${reason}`,
        type: &quot;warning&quot;,
        link: `/locations/submit`,
        priority: &quot;medium&quot;,
        metadata: {
          locationId,
          eventType: &quot;location_rejected&quot;,
          rejectorName,
          rejectionReason,
        },
      });

      console.log(
        `[LocationEventHandler] Rejection notification sent to user: ${userId}`,
      );
    } catch (error) {
      console.error(
        `[LocationEventHandler] Failed to send rejection notification:`,
        error,
      );
      // Don't rethrow to prevent event processing from failing
    }
  }

  /**
   * Log event to database or storage system
   */
  private async logEvent(
    eventType: string,
    eventId: string,
    details: Record<string, any>,
  ): Promise<void> {
    try {
      // For now, simply log to console as we don&apos;t have an event log table
      // In a real implementation, we would persist this to a database
      console.log(`[EventLog] Logging event: ${eventType}`, {
        eventId,
        timestamp: new Date().toISOString(),
        details,
      });

      // When an eventLog table is created, we would do:
      // await db.eventLog.create({
      //   data: {
      //     eventType,
      //     eventId,
      //     timestamp: new Date().toISOString(),
      //     details: JSON.stringify(details)
      //   }
      // });
    } catch (error) {
      console.error(`[LocationEventHandler] Error logging event:`, error);
      // Don't throw here to prevent event handling failure
    }
  }
}

// Create singleton instance
export const locationEventHandler = new LocationEventHandler();

// Initialize and register handler with event bus
import { eventBus } from &quot;../infrastructure/messaging/distributedEventBus&quot;;

// Register the event handler
export function registerLocationEventHandler(): void {
  console.log(&quot;[LocationEventHandler] Registering location event handler&quot;);
  eventBus.subscribe(locationEventHandler);
}
