import { db } from &quot;../lib/db&quot;;
import { eq } from &quot;drizzle-orm&quot;;
import { eventBus } from &quot;../events/event-bus&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { bookings, systemSystemEvents } from &quot;@shared/schema&quot;;
import { addWeeks, addDays, format, parseISO } from &quot;date-fns&quot;;
import { RetryExecutor } from &quot;../../lib/resilience&quot;;

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
      retryableErrors: [&quot;deadlock&quot;, &quot;timeout&quot;, &quot;connection&quot;],
    });

    return await retryExecutor.execute(async () => {
      return db.transaction(async (tx) => {
        // Update booking status to approved
        const [updatedBooking] = await tx
          .update(bookings)
          .set({
            status: &quot;approved&quot;,
            approvedById: userId,
            approvedAt: new Date(),
            updated_at: new Date(),
          })
          .where(eq(bookings.id, bookingId))
          .returning();

        if (!updatedBooking) {
          throw new Error(&quot;Booking not found&quot;);
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
              eventGenerationStatus: &quot;completed&quot;,
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
            retryableErrors: [&quot;timeout&quot;, &quot;connection&quot;, &quot;network&quot;],
          });

          await eventBusRetry.execute(async () => {
            await eventBus.publish(&quot;BOOKING_APPROVED&quot;, {
              bookingId: updatedBooking.id,
              clientId: updatedBooking.clientOrganizationId,
              approvedBy: userId,
              approvedAt: new Date().toISOString(),
              eventGenerationRequested: generateEvents,
              correlationId: uuidv4(), // Add correlation ID for distributed tracing
            });
          });
        } catch (error) {
          // Log the error but don&apos;t fail the transaction
          console.error(&quot;Failed to publish booking approval event&quot;, {
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
      date: format(date, &quot;yyyy-MM-dd&quot;),
      startTime: booking.startTime || &quot;09:00&quot;,
      endTime: booking.endTime || &quot;17:00&quot;,
      locationId: booking.locationId,
      status: &quot;scheduled&quot;,
      checkInRequired: true,
      specialInstructions: booking.notes,
    }));

    // Log system events for tracking
    const systemEventPromises = eventInstancesToCreate.map((eventData) =>
      tx.insert(systemEvents).values({
        eventType: &quot;booking_instance_created&quot;,
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
      typeof booking.startDate === &quot;string&quot;
        ? parseISO(booking.startDate)
        : booking.startDate;

    const endDate =
      typeof booking.endDate === &quot;string&quot;
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
      case &quot;weekly&quot;:
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = addWeeks(currentDate, 1);
        }
        break;

      case &quot;biweekly&quot;:
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = addWeeks(currentDate, 2);
        }
        break;

      case &quot;monthly&quot;:
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          // Approximate a month as 4 weeks
          currentDate = addWeeks(currentDate, 4);
        }
        break;

      case &quot;daily&quot;:
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
      retryableErrors: [&quot;deadlock&quot;, &quot;timeout&quot;, &quot;connection&quot;],
    });

    return await retryExecutor.execute(async () => {
      // Update the event instance with the manager assignment
      const [updatedEvent] = await db
        .update(events)
        .set({
          fieldManagerId: managerId,
          updated_at: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(&quot;Event not found&quot;);
      }

      // Publish event to event bus
      try {
        const correlationId = uuidv4();
        const eventBusRetry = new RetryExecutor({
          maxRetries: 5,
          retryableErrors: [&quot;timeout&quot;, &quot;connection&quot;, &quot;network&quot;],
        });

        await eventBusRetry.execute(async () => {
          await eventBus.publish(&quot;EVENT_MANAGER_ASSIGNED&quot;, {
            eventId: updatedEvent.id,
            bookingId: updatedEvent.bookingId,
            managerId: managerId,
            assignedBy: assignedById,
            assignedAt: new Date().toISOString(),
            correlationId,
          });
        });
      } catch (error) {
        // Log the error but don&apos;t fail the operation
        console.error(&quot;Failed to publish manager assignment event&quot;, {
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
          preparationStatus: &quot;in_progress&quot;,
          updated_at: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(&quot;Event not found&quot;);
      }

      // Publish event to event bus
      await eventBus.publish(&quot;EVENT_PREPARATION_STARTED&quot;, {
        eventId: updatedEvent.id,
        bookingId: updatedEvent.bookingId,
        startedBy: userId,
        startedAt: new Date().toISOString(),
        tasks: tasks || [],
      });

      return updatedEvent;
    } catch (error) {
      console.error(&quot;Error starting event preparation:&quot;, error);
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
          preparationStatus: &quot;ready&quot;,
          updated_at: new Date(),
        })
        .where(eq(systemEvents.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(&quot;Event not found&quot;);
      }

      // Publish event to event bus
      await eventBus.publish(&quot;EVENT_PREPARATION_COMPLETE&quot;, {
        eventId: updatedEvent.id,
        bookingId: updatedEvent.bookingId,
        readyStatus: details,
        markedBy: userId,
        markedAt: new Date().toISOString(),
      });

      return updatedEvent;
    } catch (error) {
      console.error(&quot;Error marking event as ready:&quot;, error);
      throw error;
    }
  }
}

export const bookingsEventsService = new BookingsEventsService();
