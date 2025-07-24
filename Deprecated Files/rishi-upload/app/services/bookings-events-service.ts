import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { eventBus } from "../events/event-bus";
import { v4 as uuidv4 } from "uuid";
import { bookings, systemSystemEvents } from "@shared/schema";
import { addWeeks, addDays, format, parseISO } from "date-fns";
import { RetryExecutor } from "../../lib/resilience";

/**
 * Service for handling booking workflows and system events
 */
export class BookingsEventsService {
  /**
   * Approve a booking and optionally generate event instances
   */
  async approveBooking(
    bookingId: string,
    userId: string,
    generateEvents: boolean = true,
  ) {
    const retryExecutor = new RetryExecutor({
      maxRetries: 3,
      retryableErrors: ["deadlock", "timeout", "connection"],
    });

    return await retryExecutor.execute(async () => {
      return db.transaction(async (tx) => {
        // Update booking status to approved
        const [updatedBooking] = await tx
          .update(bookings)
          .set({
            status: "approved",
            approvedById: userId,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingId))
          .returning();

        if (!updatedBooking) {
          throw new Error("Booking not found");
        }

        // Generate events if requested
        if (generateEvents) {
          const eventIds = await this.generateEventInstances(
            tx,
            updatedBooking,
          );

          // Update booking with event generation info
          await tx
            .update(bookings)
            .set({
              eventGenerationStatus: "completed",
              eventCount: eventIds.length,
              lastEventGeneratedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));
        }

        // Publish event to event bus - this happens outside the transaction
        // so we use RetryExecutor to handle failures here separately
        try {
          const eventBusRetry = new RetryExecutor({
            maxRetries: 5,
            retryableErrors: ["timeout", "connection", "network"],
          });

          await eventBusRetry.execute(async () => {
            await eventBus.publish("BOOKING_APPROVED", {
              bookingId: updatedBooking.id,
              clientId: updatedBooking.clientOrganizationId,
              approvedBy: userId,
              approvedAt: new Date().toISOString(),
              eventGenerationRequested: generateEvents,
              correlationId: uuidv4(), // Add correlation ID for distributed tracing
            });
          });
        } catch (error) {
          // Log the error but don't fail the transaction
          console.error("Failed to publish booking approval event", {
            error,
            bookingId,
          });
          // In a production environment, we might want to store failed events
          // in a dead-letter queue for later processing
        }

        return updatedBooking;
      });
    });
  }

  /**
   * Generate event instances for a booking
   */
  private async generateEventInstances(
    tx: any,
    booking: typeof bookings.$inferSelect,
  ) {
    const eventDates = this.calculateEventDates(booking);

    // Create event instances
    const eventInstancesToCreate = eventDates.map((date) => ({
      id: uuidv4(),
      bookingId: booking.id,
      date: format(date, "yyyy-MM-dd"),
      startTime: booking.startTime || "09:00",
      endTime: booking.endTime || "17:00",
      locationId: booking.locationId,
      status: "scheduled",
      checkInRequired: true,
      specialInstructions: booking.notes,
    }));

    // Log system events for tracking
    const systemEventPromises = eventInstancesToCreate.map((eventData) =>
      tx.insert(systemEvents).values({
        eventType: "booking_instance_created",
        userId: null,
        organizationId: booking.clientOrganizationId,
        metadata: eventData,
      }),
    );

    await Promise.all(systemEventPromises);
    return eventInstancesToCreate.map((event) => event.id);
  }

  /**
   * Calculate event dates based on booking recurrence pattern
   */
  private calculateEventDates(booking: typeof bookings.$inferSelect): Date[] {
    const startDate =
      typeof booking.startDate === "string"
        ? parseISO(booking.startDate)
        : booking.startDate;

    const endDate =
      typeof booking.endDate === "string"
        ? parseISO(booking.endDate)
        : booking.endDate;

    // If not recurring, just return the start date
    if (!booking.isRecurring) {
      return [startDate];
    }

    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    // Calculate dates based on recurrence pattern
    switch (booking.recurrencePattern) {
      case "weekly":
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = addWeeks(currentDate, 1);
        }
        break;

      case "biweekly":
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = addWeeks(currentDate, 2);
        }
        break;

      case "monthly":
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          // Approximate a month as 4 weeks
          currentDate = addWeeks(currentDate, 4);
        }
        break;

      case "daily":
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = addDays(currentDate, 1);
        }
        break;

      default:
        // If pattern not recognized, just use start date
        dates.push(startDate);
    }

    return dates;
  }

  /**
   * Assign a field manager to an event
   */
  async assignEventToManager(
    eventId: string,
    managerId: string,
    assignedById: string,
  ) {
    const retryExecutor = new RetryExecutor({
      maxRetries: 3,
      retryableErrors: ["deadlock", "timeout", "connection"],
    });

    return await retryExecutor.execute(async () => {
      // Update the event instance with the manager assignment
      const [updatedEvent] = await db
        .update(events)
        .set({
          fieldManagerId: managerId,
          updatedAt: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error("Event not found");
      }

      // Publish event to event bus
      try {
        const correlationId = uuidv4();
        const eventBusRetry = new RetryExecutor({
          maxRetries: 5,
          retryableErrors: ["timeout", "connection", "network"],
        });

        await eventBusRetry.execute(async () => {
          await eventBus.publish("EVENT_MANAGER_ASSIGNED", {
            eventId: updatedEvent.id,
            bookingId: updatedEvent.bookingId,
            managerId: managerId,
            assignedBy: assignedById,
            assignedAt: new Date().toISOString(),
            correlationId,
          });
        });
      } catch (error) {
        // Log the error but don't fail the operation
        console.error("Failed to publish manager assignment event", {
          error,
          eventId,
        });
      }

      return updatedEvent;
    });
  }

  /**
   * Start the preparation process for an event
   */
  async startEventPreparation(
    eventId: string,
    userId: string,
    tasks?: Array<{
      description: string;
      assignedTo?: string;
      dueDate: string;
    }>,
  ) {
    try {
      // Update the event instance to mark it as in preparation
      const [updatedEvent] = await db
        .update(events)
        .set({
          preparationStatus: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error("Event not found");
      }

      // Publish event to event bus
      await eventBus.publish("EVENT_PREPARATION_STARTED", {
        eventId: updatedEvent.id,
        bookingId: updatedEvent.bookingId,
        startedBy: userId,
        startedAt: new Date().toISOString(),
        tasks: tasks || [],
      });

      return updatedEvent;
    } catch (error) {
      console.error("Error starting event preparation:", error);
      throw error;
    }
  }

  /**
   * Mark an event as ready
   */
  async markEventReady(
    eventId: string,
    userId: string,
    details: {
      staffAssigned: boolean;
      kitsAssigned: boolean;
      logisticsConfirmed: boolean;
      venueConfirmed: boolean;
    },
  ) {
    try {
      // Update the event instance to mark it as ready
      const [updatedEvent] = await db
        .update(events)
        .set({
          preparationStatus: "ready",
          updatedAt: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error("Event not found");
      }

      // Publish event to event bus
      await eventBus.publish("EVENT_PREPARATION_COMPLETE", {
        eventId: updatedEvent.id,
        bookingId: updatedEvent.bookingId,
        readyStatus: details,
        markedBy: userId,
        markedAt: new Date().toISOString(),
      });

      return updatedEvent;
    } catch (error) {
      console.error("Error marking event as ready:", error);
      throw error;
    }
  }
}

export const bookingsEventsService = new BookingsEventsService();
