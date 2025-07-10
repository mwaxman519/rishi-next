import { db } from "@/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import { eventBus } from "@/services/event-bus";
import { bookings } from "@/shared/schema";
import {
  eventInstances,
  staffAssignments,
  eventTeamMembers,
  activityKits,
  eventStateTransitions,
  eventIssues,
  type EventInstance,
  type InsertEventInstance,
} from "./events-schema";

// Type for recurrence pattern
interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  weekDays?: number[]; // 0 = Sunday, 6 = Saturday
  monthDays?: number[]; // 1-31
  endDate?: Date; // Until this date
  endAfter?: number; // Number of occurrences
}

// Service for integrating bookings and events
export class BookingsEventsService {
  /**
   * Approve a booking and generate event instances
   * @param bookingId The ID of the booking to approve
   * @param approverId The ID of the user approving the booking
   * @param notes Optional approval notes
   */
  async approveBooking(
    bookingId: string,
    approverId: string,
    notes?: string,
  ): Promise<void> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // 1. Update booking status to approved
      const [updatedBooking] = await tx
        .update(bookings)
        .set({
          status: "approved",
          approvedBy: approverId,
          approvedAt: new Date(),
          adminNotes: notes || "",
          eventGenerationStatus: "pending",
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      if (!updatedBooking) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      // 2. Generate event instances based on the booking details
      const eventDates = await this.generateEventDates(updatedBooking);

      // 3. Create event instances for each date
      const eventInstanceData: InsertEventInstance[] = eventDates.map(
        (date) => ({
          bookingId: updatedBooking.id,
          date,
          startTime: updatedBooking.startTime,
          endTime: updatedBooking.endTime,
          locationId: updatedBooking.locationId,
          status: "scheduled",
          checkInRequired: true,
          specialInstructions: updatedBooking.specialInstructions || "",
        }),
      );

      const createdEventInstances = await tx
        .insert(eventInstances)
        .values(eventInstanceData)
        .returning();

      // 4. Update booking with event generation status and count
      await tx
        .update(bookings)
        .set({
          eventGenerationStatus: "completed",
          eventCount: createdEventInstances.length,
          lastEventGeneratedAt: new Date(),
          seriesStartDate: eventDates[0],
          seriesEndDate: eventDates[eventDates.length - 1],
        })
        .where(eq(bookings.id, bookingId));

      // 5. Publish event
      await eventBus.publish("BOOKING_APPROVED", {
        bookingId: updatedBooking.id,
        clientId: updatedBooking.clientId,
        title: updatedBooking.title,
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        notes: notes || "",
        eventDates: eventDates.map((date) => date.toISOString()),
      });

      // 6. Publish event for generated event instances
      await eventBus.publish("EVENT_INSTANCES_GENERATED", {
        bookingId: updatedBooking.id,
        clientId: updatedBooking.clientId,
        eventIds: createdEventInstances.map((e) => e.id),
        generatedBy: approverId,
        generatedAt: new Date().toISOString(),
        totalEvents: createdEventInstances.length,
      });
    });
  }

  /**
   * Assign a field manager to an event
   * @param eventId The ID of the event to assign
   * @param managerId The ID of the field manager to assign
   * @param assignedBy The ID of the user making the assignment
   */
  async assignEventToManager(
    eventId: string,
    managerId: string,
    assignedBy: string,
  ): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update the event with the field manager
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          fieldManagerId: managerId,
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Add the field manager to the event team
      await tx
        .insert(eventTeamMembers)
        .values({
          eventInstanceId: eventId,
          userId: managerId,
          role: "field_manager",
        })
        .onConflictDoNothing(); // In case they're already assigned

      // 3. Publish event
      const eventDetails = await this.getEventDetails(eventId);
      await eventBus.publish("EVENT_ASSIGNED_TO_MANAGER", {
        eventId,
        bookingId: updatedEvent.bookingId,
        managerId,
        assignedBy,
        assignedAt: new Date().toISOString(),
        eventDate: updatedEvent.date.toISOString(),
        location: eventDetails.location,
      });

      return updatedEvent;
    });
  }

  /**
   * Mark an event as being prepared
   * @param eventId The ID of the event to start preparation for
   * @param startedBy The ID of the user starting preparation
   * @param preparationTasks Optional preparation tasks
   */
  async startEventPreparation(
    eventId: string,
    startedBy: string,
    preparationTasks?: Array<{
      description: string;
      assignedTo?: string;
      dueDate: string;
    }>,
  ): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update event status
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          status: "preparation",
          preparationStatus: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Publish event
      await eventBus.publish("EVENT_PREPARATION_STARTED", {
        eventId,
        bookingId: updatedEvent.bookingId,
        startedBy,
        startedAt: new Date().toISOString(),
        preparationTasks: preparationTasks || [],
      });

      return updatedEvent;
    });
  }

  /**
   * Mark an event as ready for execution
   * @param eventId The ID of the event to mark as ready
   * @param readyBy The ID of the user marking the event as ready
   * @param details Details about the event's readiness
   */
  async markEventReady(
    eventId: string,
    readyBy: string,
    details: {
      staffAssigned: boolean;
      kitsAssigned: boolean;
      logisticsConfirmed: boolean;
      venueConfirmed: boolean;
    },
  ): Promise<EventInstance> {
    // 1. Update event status
    const [updatedEvent] = await db
      .update(eventInstances)
      .set({
        preparationStatus: "completed",
        updatedAt: new Date(),
      })
      .where(eq(eventInstances.id, eventId))
      .returning();

    if (!updatedEvent) {
      throw new Error(`Event ${eventId} not found`);
    }

    // 2. Publish event
    await eventBus.publish("EVENT_READY", {
      eventId,
      bookingId: updatedEvent.bookingId,
      readyBy,
      readyAt: new Date().toISOString(),
      staffAssigned: details.staffAssigned,
      kitsAssigned: details.kitsAssigned,
      logisticsConfirmed: details.logisticsConfirmed,
      venueConfirmed: details.venueConfirmed,
    });

    return updatedEvent;
  }

  /**
   * Mark an event as started (in progress)
   * @param eventId The ID of the event to start
   * @param startedBy The ID of the user starting the event
   */
  async startEvent(eventId: string, startedBy: string): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update event status
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Get staff who have checked in
      const staffPresent = await tx
        .select()
        .from(staffAssignments)
        .where(
          and(
            eq(staffAssignments.eventInstanceId, eventId),
            eq(staffAssignments.status, "checked_in"),
          ),
        );

      // 3. Get event location
      const eventDetails = await this.getEventDetails(eventId);

      // 4. Publish event
      await eventBus.publish("EVENT_STARTED", {
        eventId,
        bookingId: updatedEvent.bookingId,
        startedBy,
        startedAt: new Date().toISOString(),
        location: eventDetails.location,
        staffPresent: staffPresent.map((staff) => ({
          userId: staff.userId,
          role: staff.role,
          checkedInAt:
            staff.checkInTime?.toISOString() || new Date().toISOString(),
        })),
      });

      return updatedEvent;
    });
  }

  /**
   * Complete an event
   * @param eventId The ID of the event to complete
   * @param completedBy The ID of the user completing the event
   * @param details Completion details
   */
  async completeEvent(
    eventId: string,
    completedBy: string,
    details: {
      actualStartTime: string;
      actualEndTime: string;
      outcomes: {
        metExpectations: boolean;
        metrics: Record<string, number>;
        notes: string;
      };
    },
  ): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update event status
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Get staff participation details
      const staffParticipated = await tx
        .select()
        .from(staffAssignments)
        .where(
          and(
            eq(staffAssignments.eventInstanceId, eventId),
            eq(staffAssignments.status, "checked_out"),
          ),
        );

      // 3. Publish event
      await eventBus.publish("EVENT_COMPLETED", {
        eventId,
        bookingId: updatedEvent.bookingId,
        completedBy,
        completedAt: new Date().toISOString(),
        actualStartTime: details.actualStartTime,
        actualEndTime: details.actualEndTime,
        staffParticipated: staffParticipated.map((staff) => ({
          userId: staff.userId,
          role: staff.role,
          hoursWorked: staff.hoursWorked || 0,
        })),
        outcomes: details.outcomes,
      });

      // 4. Check if all events for this booking are now completed
      const allEvents = await tx
        .select()
        .from(eventInstances)
        .where(eq(eventInstances.bookingId, updatedEvent.bookingId));

      const allCompleted = allEvents.every(
        (event) => event.status === "completed" || event.status === "cancelled",
      );

      if (allCompleted) {
        // Update booking status
        await tx
          .update(bookings)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, updatedEvent.bookingId));
      }

      return updatedEvent;
    });
  }

  /**
   * Cancel an event
   * @param eventId The ID of the event to cancel
   * @param cancelledBy The ID of the user cancelling the event
   * @param reason The reason for cancellation
   * @param notifyClient Whether to notify the client
   */
  async cancelEvent(
    eventId: string,
    cancelledBy: string,
    reason: string,
    notifyClient: boolean = true,
  ): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update event status
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Cancel all staff assignments
      await tx
        .update(staffAssignments)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(staffAssignments.eventInstanceId, eventId));

      // 3. Publish event
      await eventBus.publish("EVENT_CANCELLED", {
        eventId,
        bookingId: updatedEvent.bookingId,
        cancelledBy,
        cancelledAt: new Date().toISOString(),
        reason,
        notifyClient,
      });

      return updatedEvent;
    });
  }

  /**
   * Report an issue with an event
   * @param eventId The ID of the event with an issue
   * @param reportData Issue report data
   */
  async reportEventIssue(
    eventId: string,
    reportData: {
      reportedBy: string;
      issueType: "venue" | "staff" | "kit" | "logistics" | "client" | "other";
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      immediateActionTaken?: string;
      activityId?: string;
      photoUrls?: string[];
    },
  ): Promise<EventInstance> {
    return await db.transaction(async (tx) => {
      // 1. Update event status
      const [updatedEvent] = await tx
        .update(eventInstances)
        .set({
          status: "issue_reported",
          updatedAt: new Date(),
        })
        .where(eq(eventInstances.id, eventId))
        .returning();

      if (!updatedEvent) {
        throw new Error(`Event ${eventId} not found`);
      }

      // 2. Create issue record
      await tx.insert(eventIssues).values({
        eventInstanceId: eventId,
        activityId: reportData.activityId,
        reportedBy: reportData.reportedBy,
        issueType: reportData.issueType,
        description: reportData.description,
        severity: reportData.severity,
        photoUrls: reportData.photoUrls || [],
        status: "open",
      });

      // 3. Publish event
      await eventBus.publish("EVENT_ISSUE_REPORTED", {
        eventId,
        bookingId: updatedEvent.bookingId,
        reportedBy: reportData.reportedBy,
        reportedAt: new Date().toISOString(),
        issueType: reportData.issueType,
        severity: reportData.severity,
        description: reportData.description,
        immediateActionTaken: reportData.immediateActionTaken,
      });

      return updatedEvent;
    });
  }

  /**
   * Get details about an event instance
   * @param eventId The ID of the event
   */
  async getEventDetails(eventId: string): Promise<any> {
    const event = await db
      .select()
      .from(eventInstances)
      .where(eq(eventInstances.id, eventId))
      .limit(1);

    if (!event.length) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Placeholder for getting location details
    // In real implementation, would join with locations table
    return {
      ...event[0],
      location: {
        id: event[0].locationId,
        name: "Location Name", // Would be replaced with actual location name
        address: "Location Address", // Would be replaced with actual address
      },
    };
  }

  /**
   * Generate event dates based on booking recurrence pattern
   * This is a placeholder implementation that would be replaced with actual logic
   * @param booking The booking object
   */
  private async generateEventDates(booking: any): Promise<Date[]> {
    // This is a placeholder implementation
    // In a real application, this would parse the recurrence pattern and generate dates

    const result: Date[] = [];
    const startDate = new Date(booking.startDate || new Date());

    // For simplicity, if no recurrence pattern, just return the start date
    if (!booking.recurrence) {
      return [startDate];
    }

    // Parse recurrence pattern from the booking
    const recurrence: RecurrencePattern = JSON.parse(booking.recurrence);

    let currentDate = new Date(startDate);
    const endDate = recurrence.endDate
      ? new Date(recurrence.endDate)
      : recurrence.endAfter
        ? null // Will check count instead
        : new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default max 90 days

    let occurrenceCount = 0;
    const maxOccurrences = recurrence.endAfter || 52; // Cap at 52 if no limit specified

    while (
      (endDate === null || currentDate <= endDate) &&
      occurrenceCount < maxOccurrences
    ) {
      // Check if this date should be included based on pattern
      if (this.shouldIncludeDate(currentDate, recurrence)) {
        result.push(new Date(currentDate));
        occurrenceCount++;
      }

      // Advance to next potential date
      currentDate = this.advanceDate(currentDate, recurrence);
    }

    return result;
  }

  /**
   * Determine if a date should be included based on recurrence pattern
   * @param date The date to check
   * @param pattern The recurrence pattern
   */
  private shouldIncludeDate(date: Date, pattern: RecurrencePattern): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = date.getDate(); // 1-31

    // For weekly recurrence, check if this day of week should be included
    if (
      pattern.frequency === "weekly" &&
      pattern.weekDays &&
      pattern.weekDays.length > 0
    ) {
      return pattern.weekDays.includes(dayOfWeek);
    }

    // For monthly recurrence, check if this day of month should be included
    if (
      pattern.frequency === "monthly" &&
      pattern.monthDays &&
      pattern.monthDays.length > 0
    ) {
      return pattern.monthDays.includes(dayOfMonth);
    }

    // For daily or default cases, always include
    return true;
  }

  /**
   * Advance date according to recurrence pattern
   * @param date The current date
   * @param pattern The recurrence pattern
   */
  private advanceDate(date: Date, pattern: RecurrencePattern): Date {
    const result = new Date(date);
    const interval = pattern.interval || 1;

    switch (pattern.frequency) {
      case "daily":
        result.setDate(result.getDate() + interval);
        break;
      case "weekly":
        result.setDate(result.getDate() + interval * 7);
        break;
      case "monthly":
        result.setMonth(result.getMonth() + interval);
        break;
      default:
        result.setDate(result.getDate() + 1);
    }

    return result;
  }
}

// Export singleton instance
export const bookingsEventsService = new BookingsEventsService();
