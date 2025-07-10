/**
 * Events Service - Core business logic for event management
 */
import { EventsRepository } from "./repository";
import {
  Event,
  EventStaffAssignment,
  EventChecklistItem,
  CreateEventParams,
  UpdateEventParams,
  EventStatus,
  CreateStaffAssignmentParams,
  UpdateStaffAssignmentParams,
  CreateChecklistItemParams,
  UpdateChecklistItemParams,
  EventFilters,
  ApproveEventParams,
  RejectEventParams,
} from "./models";
import { organizationService } from "../organizations";
import { rbacService } from "../rbac";

export class EventsService {
  private repository: EventsRepository;

  constructor() {
    this.repository = new EventsRepository();
  }

  /**
   * Get all events with optional filtering
   */
  async getAllEvents(filters: EventFilters = {}): Promise<Event[]> {
    return this.repository.findAll(filters);
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event | null> {
    return this.repository.findById(id);
  }

  /**
   * Create a new event
   */
  async createEvent(
    data: CreateEventParams,
    createdById: string,
  ): Promise<Event> {
    // Validate organization exists
    const organization = await organizationService.getOrganizationById(
      data.organizationId,
    );
    if (!organization) {
      throw new Error(`Organization with ID ${data.organizationId} not found`);
    }

    // If location provided, validate it exists (stub for now)
    if (data.locationId) {
      // This would check the location service once implemented
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // For recurring events, validate recurrence pattern and end date
    if (data.isRecurring) {
      if (!data.recurrencePattern) {
        throw new Error("Recurrence pattern is required for recurring events");
      }

      if (data.recurrenceEndDate) {
        const recurrenceEndDate = new Date(data.recurrenceEndDate);
        if (recurrenceEndDate <= endDate) {
          throw new Error("Recurrence end date must be after event end date");
        }
      }
    }

    return this.repository.create(data, createdById);
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventParams): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Check if we're trying to update an event that's already finalized or cancelled
    if (
      existingEvent.status === EventStatus.FINALIZED ||
      existingEvent.status === EventStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot update event with status ${existingEvent.status}`,
      );
    }

    // If changing dates, validate
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        throw new Error("Start date must be before end date");
      }
    } else if (data.startDate && !data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(existingEvent.endDate);

      if (startDate >= endDate) {
        throw new Error("Start date must be before existing end date");
      }
    } else if (!data.startDate && data.endDate) {
      const startDate = new Date(existingEvent.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        throw new Error("Existing start date must be before end date");
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Only draft events can be deleted
    if (existingEvent.status !== EventStatus.DRAFT) {
      throw new Error(
        `Cannot delete event with status ${existingEvent.status}`,
      );
    }

    return this.repository.delete(id);
  }

  /**
   * Submit an event for approval
   */
  async submitEventForApproval(id: string): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Only draft events can be submitted for approval
    if (existingEvent.status !== EventStatus.DRAFT) {
      throw new Error(
        `Cannot submit event with status ${existingEvent.status} for approval`,
      );
    }

    // Additional validation can be added here (e.g., required fields, etc.)

    return this.repository.submitForApproval(id);
  }

  /**
   * Approve an event
   */
  async approveEvent(
    params: ApproveEventParams,
    reviewerId: string,
  ): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(params.id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${params.id} not found`);
    }

    // Only pending approval events can be approved
    if (existingEvent.status !== EventStatus.PENDING_APPROVAL) {
      throw new Error(
        `Cannot approve event with status ${existingEvent.status}`,
      );
    }

    return this.repository.approve(params.id, reviewerId);
  }

  /**
   * Reject an event
   */
  async rejectEvent(
    params: RejectEventParams,
    reviewerId: string,
  ): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(params.id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${params.id} not found`);
    }

    // Only pending approval events can be rejected
    if (existingEvent.status !== EventStatus.PENDING_APPROVAL) {
      throw new Error(
        `Cannot reject event with status ${existingEvent.status}`,
      );
    }

    // Reason is required for rejecting an event
    if (!params.reason) {
      throw new Error("Rejection reason is required");
    }

    return this.repository.reject(params.id, reviewerId, params.reason);
  }

  /**
   * Cancel an event
   */
  async cancelEvent(id: string, reason?: string): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Cannot cancel already cancelled, completed, or finalized events
    if (
      existingEvent.status === EventStatus.CANCELLED ||
      existingEvent.status === EventStatus.COMPLETED ||
      existingEvent.status === EventStatus.FINALIZED
    ) {
      throw new Error(
        `Cannot cancel event with status ${existingEvent.status}`,
      );
    }

    return this.repository.cancel(id, reason);
  }

  /**
   * Mark event as in progress
   */
  async startEvent(id: string): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Only approved events can be started
    if (existingEvent.status !== EventStatus.APPROVED) {
      throw new Error(`Cannot start event with status ${existingEvent.status}`);
    }

    // Check if the event date is today or in the past
    const now = new Date();
    const startDate = new Date(existingEvent.startDate);
    if (startDate > now) {
      throw new Error("Cannot start an event before its scheduled start date");
    }

    return this.repository.update(id, { status: EventStatus.IN_PROGRESS });
  }

  /**
   * Mark event as completed
   */
  async completeEvent(id: string): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Only in progress events can be completed
    if (existingEvent.status !== EventStatus.IN_PROGRESS) {
      throw new Error(
        `Cannot complete event with status ${existingEvent.status}`,
      );
    }

    return this.repository.update(id, { status: EventStatus.COMPLETED });
  }

  /**
   * Finalize an event (post-event processing completed)
   */
  async finalizeEvent(id: string): Promise<Event> {
    // Get the current event state
    const existingEvent = await this.repository.findById(id);

    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }

    // Only completed events can be finalized
    if (existingEvent.status !== EventStatus.COMPLETED) {
      throw new Error(
        `Cannot finalize event with status ${existingEvent.status}`,
      );
    }

    // Additional validation can be added here (e.g., all checklist items complete)

    return this.repository.update(id, { status: EventStatus.FINALIZED });
  }

  /**
   * Staff assignment methods
   */
  async createStaffAssignment(
    data: CreateStaffAssignmentParams,
  ): Promise<EventStaffAssignment> {
    // Validate event exists and is in a valid state
    const event = await this.repository.findById(data.eventId);
    if (!event) {
      throw new Error(`Event with ID ${data.eventId} not found`);
    }

    if (
      event.status === EventStatus.CANCELLED ||
      event.status === EventStatus.FINALIZED
    ) {
      throw new Error(`Cannot add staff to event with status ${event.status}`);
    }

    // Validate times
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }

    // Validate times are within event times
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);

    if (startTime < eventStartDate || endTime > eventEndDate) {
      throw new Error("Staff assignment times must be within event times");
    }

    return this.repository.createStaffAssignment(data);
  }

  async updateStaffAssignment(
    id: string,
    data: UpdateStaffAssignmentParams,
  ): Promise<EventStaffAssignment> {
    // Validation logic similar to creation would go here
    return this.repository.updateStaffAssignment(id, data);
  }

  async deleteStaffAssignment(id: string): Promise<void> {
    return this.repository.deleteStaffAssignment(id);
  }

  async getStaffAssignmentsForEvent(
    eventId: string,
  ): Promise<EventStaffAssignment[]> {
    return this.repository.getStaffAssignmentsForEvent(eventId);
  }

  /**
   * Checklist item methods
   */
  async createChecklistItem(
    data: CreateChecklistItemParams,
  ): Promise<EventChecklistItem> {
    // Validate event exists
    const event = await this.repository.findById(data.eventId);
    if (!event) {
      throw new Error(`Event with ID ${data.eventId} not found`);
    }

    // Validation for due date
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const eventEndDate = new Date(event.endDate);

      if (dueDate > eventEndDate) {
        throw new Error(
          "Checklist item due date cannot be after event end date",
        );
      }
    }

    return this.repository.createChecklistItem(data);
  }

  async updateChecklistItem(
    id: string,
    data: UpdateChecklistItemParams,
  ): Promise<EventChecklistItem> {
    // Validation logic similar to creation would go here
    return this.repository.updateChecklistItem(id, data);
  }

  async deleteChecklistItem(id: string): Promise<void> {
    return this.repository.deleteChecklistItem(id);
  }

  async getChecklistItemsForEvent(
    eventId: string,
  ): Promise<EventChecklistItem[]> {
    return this.repository.getChecklistItemsForEvent(eventId);
  }
}
