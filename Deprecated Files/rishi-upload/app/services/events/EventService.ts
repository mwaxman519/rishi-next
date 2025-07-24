/**
 * EventService.ts
 *
 * Service for managing events in the Rishi platform
 * Follows the service pattern from our microservices architecture
 */

import { db } from "../../db";
import {
  events,
  eventAssignments,
  activities,
  activityAssignments,
  eventStateTransitions,
} from "@/app/lib/schema";
import { eq, and, or, gt, lt, gte, lte, ne, inArray } from "drizzle-orm";
import { EventBus } from "@/app/lib/events/EventBus";

// Organization context type for data isolation
export interface OrganizationContext {
  organizationId: string;
  restrictToOrganization: boolean;
}

// Event types for our message bus
export enum EventActionTypes {
  EVENT_CREATED = "event.created",
  EVENT_UPDATED = "event.updated",
  EVENT_CANCELLED = "event.cancelled",
  EVENT_COMPLETED = "event.completed",
  STAFF_ASSIGNED = "event.staff.assigned",
  STAFF_UNASSIGNED = "event.staff.unassigned",
  STAFF_CHECKED_IN = "event.staff.checked_in",
  STAFF_CHECKED_OUT = "event.staff.checked_out",
}

// Type-safe event payloads
export interface EventCreatedPayload {
  eventId: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  locationId: string;
  organizationId: string;
  createdById: string;
}

export interface EventUpdatedPayload {
  eventId: string;
  title: string;
  changes: Record<string, any>;
  updatedAt: string;
}

export interface EventCancelledPayload {
  eventId: string;
  reason: string;
  cancelledAt: string;
}

export interface EventStaffAssignmentPayload {
  eventId: string;
  userId: string;
  role: string;
  assignedById: string;
  assignedAt: string;
}

// Query options type for filtering events
export interface EventQueryOptions {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Staff assignment type
export interface EventStaffAssignment {
  userId: string;
  role: string;
  activityIds?: string[]; // Optional - if not provided, assign to all activities
}

/**
 * Service for managing events
 */
export class EventService {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }

  /**
   * Get events with optional filtering
   * Respects organization boundaries based on context
   */
  async getEvents(
    options: EventQueryOptions,
    organizationContext: OrganizationContext,
  ) {
    try {
      // Start building the query
      let query = db.select().from(events);

      // Apply organization boundary
      if (organizationContext.restrictToOrganization) {
        query = query.where(
          eq(systemEvents.organizationId, organizationContext.organizationId),
        );
      }

      // Apply status filter
      if (options.status) {
        query = query.where(eq(systemEvents.status, options.status));
      }

      // Apply date range filters
      if (options.startDate) {
        query = query.where(gte(systemEvents.startDateTime, options.startDate));
      }

      if (options.endDate) {
        query = query.where(lte(systemEvents.startDateTime, options.endDate));
      }

      // Apply location filter
      if (options.locationId) {
        query = query.where(eq(systemEvents.locationId, options.locationId));
      }

      // Apply search filter (if needed, would require additional complexity)
      // This is a placeholder for full-text search

      // Apply pagination
      if (options.page !== undefined && options.pageSize !== undefined) {
        const offset = options.page * options.pageSize;
        query = query.limit(options.pageSize).offset(offset);
      }

      // Execute query
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Get a single event by ID
   * Respects organization boundaries based on context
   */
  async getEventById(
    eventId: string,
    organizationContext: OrganizationContext,
  ) {
    try {
      let query = db.select().from(events).where(eq(systemEvents.id, eventId));

      // Apply organization boundary
      if (organizationContext.restrictToOrganization) {
        query = query.where(
          eq(systemEvents.organizationId, organizationContext.organizationId),
        );
      }

      const [event] = await query;

      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      return event;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new event
   * Enforces organization boundaries based on context
   */
  async createEvent(
    eventData: any,
    organizationContext: OrganizationContext,
    currentUserId: string,
  ) {
    try {
      // Validate organizationId from the request matches the context
      if (
        organizationContext.restrictToOrganization &&
        eventData.organizationId !== organizationContext.organizationId
      ) {
        throw new Error("Cannot create event for another organization");
      }

      // Create the event
      const [createdEvent] = await db
        .insert(systemEvents)
        .values({
          ...eventData,
          createdById: currentUserId,
          // Ensure organization is set from context if not provided
          organizationId:
            eventData.organizationId || organizationContext.organizationId,
        })
        .returning();

      // Publish event created message to the event bus
      this.eventBus.publish(EventActionTypes.EVENT_CREATED, {
        eventId: createdEvent.id,
        title: createdEvent.title,
        startDateTime: createdEvent.startDateTime.toISOString(),
        endDateTime: createdEvent.endDateTime.toISOString(),
        locationId: createdEvent.locationId,
        organizationId: createdEvent.organizationId,
        createdById: createdEvent.createdById,
      });

      return createdEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  /**
   * Update an existing event
   * Enforces organization boundaries based on context
   */
  async updateEvent(
    eventId: string,
    eventData: any,
    organizationContext: OrganizationContext,
  ) {
    try {
      // Get the existing event to check permissions
      const existingEvent = await this.getEventById(
        eventId,
        organizationContext,
      );

      // If we get here, the event exists and the user has permission to access it

      // Update the event
      const [updatedEvent] = await db
        .update(events)
        .set({
          ...eventData,
          updatedAt: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      // Publish event updated message to the event bus
      this.eventBus.publish(EventActionTypes.EVENT_UPDATED, {
        eventId: updatedEvent.id,
        title: updatedEvent.title,
        changes: eventData,
        updatedAt: updatedEvent.updatedAt.toISOString(),
      });

      return updatedEvent;
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an event
   * Enforces organization boundaries based on context
   */
  async cancelEvent(
    eventId: string,
    reason: string,
    organizationContext: OrganizationContext,
    currentUserId: string,
  ) {
    try {
      // Get the existing event to check permissions
      const existingEvent = await this.getEventById(
        eventId,
        organizationContext,
      );

      // If we get here, the event exists and the user has permission to access it

      // Begin transaction to handle cascading cancellations
      return await db.transaction(async (tx) => {
        // Update event status
        const [cancelledEvent] = await tx
          .update(events)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(systemEvents.id, eventId))
          .returning();

        // Record event state transition
        await tx.insert(eventStateTransitions).values({
          eventId,
          fromState: existingEvent.status,
          toState: "canceled",
          reason,
          transitionedById: currentUserId,
        });

        // Cancel all activities associated with this event
        await tx
          .update(activities)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(activities.eventId, eventId));

        // Cancel all staff assignments
        await tx
          .update(eventAssignments)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(eventAssignments.eventId, eventId));

        // Get all activities for this event
        const eventActivities = await tx
          .select({ id: activities.id })
          .from(activities)
          .where(eq(activities.eventId, eventId));

        // Cancel all activity assignments if there are any activities
        if (eventActivities.length > 0) {
          const activityIds = eventActivities.map((a) => a.id);

          await tx
            .update(activityAssignments)
            .set({
              status: "canceled",
              updatedAt: new Date(),
            })
            .where(inArray(activityAssignments.activityId, activityIds));
        }

        // Publish event cancelled message to the event bus
        this.eventBus.publish(EventActionTypes.EVENT_CANCELLED, {
          eventId: cancelledEvent.id,
          reason,
          cancelledAt: new Date().toISOString(),
        });

        return cancelledEvent;
      });
    } catch (error) {
      console.error(`Error cancelling event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Assign staff to an event
   * Enforces organization boundaries based on context
   */
  async assignStaffToEvent(
    eventId: string,
    staffAssignments: EventStaffAssignment[],
    organizationContext: OrganizationContext,
    currentUserId: string,
  ) {
    try {
      // Get the existing event to check permissions
      const existingEvent = await this.getEventById(
        eventId,
        organizationContext,
      );

      // If we get here, the event exists and the user has permission to access it

      // Begin transaction for assigning staff
      return await db.transaction(async (tx) => {
        const assignments = [];

        // Process each staff assignment
        for (const assignment of staffAssignments) {
          // Create event-level assignment
          const [eventAssignment] = await tx
            .insert(eventAssignments)
            .values({
              eventId,
              userId: assignment.userId,
              role: assignment.role,
              status: "assigned",
            })
            .returning();

          assignments.push(eventAssignment);

          // Get all activities for this event
          const eventActivities = await tx
            .select()
            .from(activities)
            .where(eq(activities.eventId, eventId));

          // If specific activities were selected
          if (assignment.activityIds && assignment.activityIds.length > 0) {
            // Verify all activities belong to the event
            const eventActivityIds = new Set(eventActivities.map((a) => a.id));
            const validActivityIds = assignment.activityIds.filter((id) =>
              eventActivityIds.has(id),
            );

            // Create activity assignments
            if (validActivityIds.length > 0) {
              await tx.insert(activityAssignments).values(
                validActivityIds.map((activityId) => ({
                  activityId,
                  userId: assignment.userId,
                  role: assignment.role,
                  status: "assigned",
                })),
              );
            }
          } else if (eventActivities.length > 0) {
            // If no specific activities selected, assign to all event activities
            await tx.insert(activityAssignments).values(
              eventActivities.map((activity) => ({
                activityId: activity.id,
                userId: assignment.userId,
                role: assignment.role,
                status: "assigned",
              })),
            );
          }

          // Publish staff assigned message to the event bus
          this.eventBus.publish(EventActionTypes.STAFF_ASSIGNED, {
            eventId,
            userId: assignment.userId,
            role: assignment.role,
            assignedById: currentUserId,
            assignedAt: new Date().toISOString(),
          });
        }

        return assignments;
      });
    } catch (error) {
      console.error(`Error assigning staff to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get staff assigned to an event
   * Enforces organization boundaries based on context
   */
  async getEventStaff(
    eventId: string,
    organizationContext: OrganizationContext,
  ) {
    try {
      // Get the existing event to check permissions
      await this.getEventById(eventId, organizationContext);

      // If we get here, the event exists and the user has permission to access it

      // Get all staff assignments for this event
      const staffAssignments = await db.query.eventAssignments.findMany({
        where: eq(eventAssignments.eventId, eventId),
        with: {
          user: true,
        },
      });

      return staffAssignments;
    } catch (error) {
      console.error(`Error fetching staff for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a location is available for an event
   */
  async checkLocationAvailability(
    locationId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeEventId?: string,
  ) {
    try {
      // Find events at this location during the requested time
      let query = db
        .select()
        .from(events)
        .where(
          and(
            eq(systemEvents.locationId, locationId),
            or(
              // Events that start during the requested time
              and(
                gte(systemEvents.startDateTime, startDateTime),
                lt(systemEvents.startDateTime, endDateTime),
              ),
              // Events that end during the requested time
              and(
                gt(systemEvents.endDateTime, startDateTime),
                lte(systemEvents.endDateTime, endDateTime),
              ),
              // Events that completely encompass the requested time
              and(
                lte(systemEvents.startDateTime, startDateTime),
                gte(systemEvents.endDateTime, endDateTime),
              ),
            ),
            // Only consider active events
            eq(systemEvents.status, "scheduled"),
          ),
        );

      // Exclude the current event when checking for updates
      if (excludeEventId) {
        query = query.where(ne(systemEvents.id, excludeEventId));
      }

      const conflictingEvents = await query;

      return {
        available: conflictingEvents.length === 0,
        conflictingEvents:
          conflictingEvents.length > 0 ? conflictingEvents : undefined,
      };
    } catch (error) {
      console.error("Error checking location availability:", error);
      throw error;
    }
  }

  /**
   * Check if staff is available for an event
   */
  async checkStaffAvailability(
    staffId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeEventId?: string,
  ) {
    try {
      // Find events this staff is assigned to during the requested time
      let query = db
        .select()
        .from(events)
        .innerJoin(
          eventAssignments,
          eq(systemEvents.id, eventAssignments.eventId),
        )
        .where(
          and(
            eq(eventAssignments.userId, staffId),
            or(
              // Events that start during the requested time
              and(
                gte(systemEvents.startDateTime, startDateTime),
                lt(systemEvents.startDateTime, endDateTime),
              ),
              // Events that end during the requested time
              and(
                gt(systemEvents.endDateTime, startDateTime),
                lte(systemEvents.endDateTime, endDateTime),
              ),
              // Events that completely encompass the requested time
              and(
                lte(systemEvents.startDateTime, startDateTime),
                gte(systemEvents.endDateTime, endDateTime),
              ),
            ),
            // Only consider active events and assignments
            eq(systemEvents.status, "scheduled"),
            eq(eventAssignments.status, "assigned"),
          ),
        );

      // Exclude the current event when checking for updates
      if (excludeEventId) {
        query = query.where(ne(systemEvents.id, excludeEventId));
      }

      const conflictingEvents = await query;

      return {
        available: conflictingEvents.length === 0,
        conflictingEvents:
          conflictingEvents.length > 0 ? conflictingEvents : undefined,
      };
    } catch (error) {
      console.error("Error checking staff availability:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const eventService = new EventService();
