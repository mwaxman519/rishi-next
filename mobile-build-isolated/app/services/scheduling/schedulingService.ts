/**
 * Scheduling Service - Core business logic for scheduling management
 */
import { SchedulingRepository } from "./repository";
import {
  Schedule,
  ScheduleShift,
  ShiftAssignment,
  ScheduleTemplate,
  ShiftTemplate,
  CreateScheduleParams,
  UpdateScheduleParams,
  CreateShiftParams,
  UpdateShiftParams,
  CreateShiftAssignmentParams,
  UpdateShiftAssignmentParams,
  CreateScheduleTemplateParams,
  UpdateScheduleTemplateParams,
  CreateShiftTemplateParams,
  UpdateShiftTemplateParams,
  ScheduleStatus,
  ScheduleFilters,
  ShiftFilters,
  AssignmentFilters,
  PublishScheduleParams,
  FinalizeScheduleParams,
} from "./models";
import { organizationService } from "../organizations";
import { eventsService } from "../events";
import { staffService } from "../staff";
import { EventStatus } from "../events/models";
import { StaffStatus } from "../staff/models";

export class SchedulingService {
  private repository: SchedulingRepository;

  constructor() {
    this.repository = new SchedulingRepository();
  }

  /**
   * Get all schedules with optional filtering
   */
  async getAllSchedules(filters: ScheduleFilters = {}): Promise<Schedule[]> {
    return this.repository.findAllSchedules(filters);
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: string): Promise<Schedule | null> {
    return this.repository.findScheduleById(id);
  }

  /**
   * Create a new schedule
   */
  async createSchedule(
    data: CreateScheduleParams,
    createdById: string,
    organizationId: string,
  ): Promise<Schedule> {
    // Validate event exists and is in an appropriate state
    const event = await eventsService.getEventById(data.eventId);
    if (!event) {
      throw new Error(`Event with ID ${data.eventId} not found`);
    }

    // Check if event is in a state that allows scheduling
    if (
      event.status === EventStatus.CANCELLED ||
      event.status === EventStatus.REJECTED
    ) {
      throw new Error(
        `Cannot create schedule for event with status ${event.status}`,
      );
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    // If using a template, apply it
    let newSchedule: Schedule;
    if (data.templateId) {
      // This would find the template and apply it to create the schedule
      // For now, just create the schedule without template
      newSchedule = await this.repository.createSchedule(
        data,
        createdById,
        organizationId,
      );

      // Then would create shifts based on the template
      // const template = await this.repository.findScheduleTemplateById(data.templateId);
      // if (template) {
      //   await this.applyTemplateToSchedule(template, newSchedule.id);
      // }
    } else {
      // Create a schedule without a template
      newSchedule = await this.repository.createSchedule(
        data,
        createdById,
        organizationId,
      );
    }

    return newSchedule;
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(
    id: string,
    data: UpdateScheduleParams,
  ): Promise<Schedule> {
    // Get the current schedule state
    const existingSchedule = await this.repository.findScheduleById(id);

    if (!existingSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }

    // Check if schedule status allows updates
    if (existingSchedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot update a finalized schedule`);
    }

    // If changing event, validate it exists
    if (data.eventId && data.eventId !== existingSchedule.eventId) {
      const event = await eventsService.getEventById(data.eventId);
      if (!event) {
        throw new Error(`Event with ID ${data.eventId} not found`);
      }

      // Check if new event is in a state that allows scheduling
      if (
        event.status === EventStatus.CANCELLED ||
        event.status === EventStatus.REJECTED
      ) {
        throw new Error(
          `Cannot assign schedule to event with status ${event.status}`,
        );
      }
    }

    // If changing dates, validate
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate > endDate) {
        throw new Error("Start date must be before or equal to end date");
      }
    } else if (data.startDate && !data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(existingSchedule.endDate);

      if (startDate > endDate) {
        throw new Error("Start date must be before existing end date");
      }
    } else if (!data.startDate && data.endDate) {
      const startDate = new Date(existingSchedule.startDate);
      const endDate = new Date(data.endDate);

      if (startDate > endDate) {
        throw new Error("Existing start date must be before end date");
      }
    }

    // Check if status change is valid
    if (data.status) {
      if (
        data.status === ScheduleStatus.PUBLISHED &&
        existingSchedule.status === ScheduleStatus.DRAFT
      ) {
        throw new Error("Use publishSchedule method to publish a schedule");
      }

      if (
        data.status === ScheduleStatus.FINALIZED &&
        (existingSchedule.status === ScheduleStatus.DRAFT ||
          existingSchedule.status === ScheduleStatus.PUBLISHED)
      ) {
        throw new Error("Use finalizeSchedule method to finalize a schedule");
      }
    }

    return this.repository.updateSchedule(id, data);
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(id: string): Promise<void> {
    // Get the current schedule state
    const existingSchedule = await this.repository.findScheduleById(id);

    if (!existingSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }

    // Check if schedule status allows deletion
    if (existingSchedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot delete a finalized schedule`);
    }

    return this.repository.deleteSchedule(id);
  }

  /**
   * Publish a schedule
   */
  async publishSchedule(
    params: PublishScheduleParams,
    publishedById: string,
  ): Promise<Schedule> {
    // Get the current schedule state
    const existingSchedule = await this.repository.findScheduleById(params.id);

    if (!existingSchedule) {
      throw new Error(`Schedule with ID ${params.id} not found`);
    }

    // Check if schedule status allows publishing
    if (existingSchedule.status !== ScheduleStatus.DRAFT) {
      throw new Error(`Can only publish schedules in DRAFT status`);
    }

    // Publish the schedule
    const publishedSchedule = await this.repository.publishSchedule(
      params.id,
      publishedById,
    );

    // Notify staff if requested
    if (params.notifyStaff) {
      // This would send notifications to staff (email, SMS, etc.)
      // Not implemented in this placeholder version
    }

    return publishedSchedule;
  }

  /**
   * Finalize a schedule
   */
  async finalizeSchedule(
    params: FinalizeScheduleParams,
    finalizedById: string,
  ): Promise<Schedule> {
    // Get the current schedule state
    const existingSchedule = await this.repository.findScheduleById(params.id);

    if (!existingSchedule) {
      throw new Error(`Schedule with ID ${params.id} not found`);
    }

    // Check if schedule status allows finalizing
    if (existingSchedule.status !== ScheduleStatus.PUBLISHED) {
      throw new Error(`Can only finalize schedules in PUBLISHED status`);
    }

    return this.repository.finalizeSchedule(params.id, finalizedById);
  }

  // Shift methods

  /**
   * Get shifts with optional filtering
   */
  async getShifts(filters: ShiftFilters = {}): Promise<ScheduleShift[]> {
    return this.repository.findShifts(filters);
  }

  /**
   * Get shift by ID
   */
  async getShiftById(id: string): Promise<ScheduleShift | null> {
    return this.repository.findShiftById(id);
  }

  /**
   * Get shifts for a schedule
   */
  async getShiftsForSchedule(scheduleId: string): Promise<ScheduleShift[]> {
    // Validate schedule exists
    const schedule = await this.repository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    return this.repository.findShiftsForSchedule(scheduleId);
  }

  /**
   * Create a new shift
   */
  async createShift(data: CreateShiftParams): Promise<ScheduleShift> {
    // Validate schedule exists
    const schedule = await this.repository.findScheduleById(data.scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${data.scheduleId} not found`);
    }

    // Check if schedule status allows adding shifts
    if (schedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot add shifts to a finalized schedule`);
    }

    // Validate shift time
    const fullStartDate = new Date(`${data.date}T${data.startTime}`);
    const fullEndDate = new Date(`${data.date}T${data.endTime}`);

    if (fullStartDate >= fullEndDate) {
      throw new Error("Shift start time must be before end time");
    }

    // Check if shift date is within schedule date range
    const scheduleStartDate = new Date(schedule.startDate);
    const scheduleEndDate = new Date(schedule.endDate);
    const shiftDate = new Date(data.date);

    if (shiftDate < scheduleStartDate || shiftDate > scheduleEndDate) {
      throw new Error("Shift date must be within schedule date range");
    }

    // Production implementation - validate location exists in database
    if (data.locationId) {
      // This would check the location service once implemented
    }

    return this.repository.createShift(data);
  }

  /**
   * Update an existing shift
   */
  async updateShift(
    id: string,
    data: UpdateShiftParams,
  ): Promise<ScheduleShift> {
    // Get the current shift state
    const existingShift = await this.repository.findShiftById(id);

    if (!existingShift) {
      throw new Error(`Shift with ID ${id} not found`);
    }

    // Get the schedule to check its status
    const schedule = await this.repository.findScheduleById(
      existingShift.scheduleId,
    );
    if (!schedule) {
      throw new Error(`Schedule with ID ${existingShift.scheduleId} not found`);
    }

    // Check if schedule status allows updating shifts
    if (schedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot update shifts in a finalized schedule`);
    }

    // Validate time and date changes if provided
    if (data.date && (data.startTime || data.endTime)) {
      const startTime = data.startTime || existingShift.startTime;
      const endTime = data.endTime || existingShift.endTime;
      const fullStartDate = new Date(`${data.date}T${startTime}`);
      const fullEndDate = new Date(`${data.date}T${endTime}`);

      if (fullStartDate >= fullEndDate) {
        throw new Error("Shift start time must be before end time");
      }

      // Check if new date is within schedule date range
      const scheduleStartDate = new Date(schedule.startDate);
      const scheduleEndDate = new Date(schedule.endDate);
      const shiftDate = new Date(data.date);

      if (shiftDate < scheduleStartDate || shiftDate > scheduleEndDate) {
        throw new Error("Shift date must be within schedule date range");
      }
    } else if (!data.date && (data.startTime || data.endTime)) {
      const startTime = data.startTime || existingShift.startTime;
      const endTime = data.endTime || existingShift.endTime;
      const fullStartDate = new Date(`${existingShift.date}T${startTime}`);
      const fullEndDate = new Date(`${existingShift.date}T${endTime}`);

      if (fullStartDate >= fullEndDate) {
        throw new Error("Shift start time must be before end time");
      }
    }

    // Production implementation - validate location exists in database
    if (data.locationId) {
      // This would check the location service once implemented
    }

    return this.repository.updateShift(id, data);
  }

  /**
   * Delete a shift
   */
  async deleteShift(id: string): Promise<void> {
    // Get the current shift state
    const existingShift = await this.repository.findShiftById(id);

    if (!existingShift) {
      throw new Error(`Shift with ID ${id} not found`);
    }

    // Get the schedule to check its status
    const schedule = await this.repository.findScheduleById(
      existingShift.scheduleId,
    );
    if (!schedule) {
      throw new Error(`Schedule with ID ${existingShift.scheduleId} not found`);
    }

    // Check if schedule status allows deleting shifts
    if (schedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot delete shifts in a finalized schedule`);
    }

    return this.repository.deleteShift(id);
  }

  // Assignment methods

  /**
   * Get assignments with optional filtering
   */
  async getAssignments(
    filters: AssignmentFilters = {},
  ): Promise<ShiftAssignment[]> {
    return this.repository.findAssignments(filters);
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string): Promise<ShiftAssignment | null> {
    return this.repository.findAssignmentById(id);
  }

  /**
   * Get assignments for a shift
   */
  async getAssignmentsForShift(shiftId: string): Promise<ShiftAssignment[]> {
    // Validate shift exists
    const shift = await this.repository.findShiftById(shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${shiftId} not found`);
    }

    return this.repository.findAssignmentsForShift(shiftId);
  }

  /**
   * Get assignments for a staff member
   */
  async getAssignmentsForStaff(staffId: string): Promise<ShiftAssignment[]> {
    // Validate staff exists
    const staff = await staffService.getStaffMemberById(staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    return this.repository.findAssignmentsForStaff(staffId);
  }

  /**
   * Create a new assignment
   */
  async createAssignment(
    data: CreateShiftAssignmentParams,
  ): Promise<ShiftAssignment> {
    // Validate shift exists
    const shift = await this.repository.findShiftById(data.shiftId);
    if (!shift) {
      throw new Error(`Shift with ID ${data.shiftId} not found`);
    }

    // Validate schedule exists
    const schedule = await this.repository.findScheduleById(data.scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${data.scheduleId} not found`);
    }

    // Check if schedule status allows adding assignments
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new Error(`Cannot add assignments to a cancelled schedule`);
    }

    // Validate staff exists and is active
    const staff = await staffService.getStaffMemberById(data.staffId);
    if (!staff) {
      throw new Error(`Staff member with ID ${data.staffId} not found`);
    }

    if (staff.status !== StaffStatus.ACTIVE) {
      throw new Error(
        `Cannot assign inactive staff member with status ${staff.status}`,
      );
    }

    // Check if staff is available for this shift
    // This would use the staffService.isStaffAvailable method
    // For now, we assume availability is handled elsewhere

    // Check if staff already assigned to this shift
    const existingAssignments = await this.repository.findAssignmentsForShift(
      data.shiftId,
    );
    const alreadyAssigned = existingAssignments.some(
      (a) => a.staffId === data.staffId,
    );

    if (alreadyAssigned) {
      throw new Error(`Staff member already assigned to this shift`);
    }

    // Create the assignment
    return this.repository.createAssignment(data);
  }

  /**
   * Update an existing assignment
   */
  async updateAssignment(
    id: string,
    data: UpdateShiftAssignmentParams,
  ): Promise<ShiftAssignment> {
    // Get the current assignment state
    const existingAssignment = await this.repository.findAssignmentById(id);

    if (!existingAssignment) {
      throw new Error(`Assignment with ID ${id} not found`);
    }

    // Get the schedule to check its status
    const schedule = await this.repository.findScheduleById(
      existingAssignment.scheduleId,
    );
    if (!schedule) {
      throw new Error(
        `Schedule with ID ${existingAssignment.scheduleId} not found`,
      );
    }

    // Check if schedule status allows updating assignments
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new Error(`Cannot update assignments in a cancelled schedule`);
    }

    // Special validations for check-in/out times
    if (data.checkedInAt || data.checkedOutAt) {
      // If providing check-out time, ensure check-in time exists
      if (
        data.checkedOutAt &&
        !data.checkedInAt &&
        !existingAssignment.checkedInAt
      ) {
        throw new Error(`Cannot check out without checking in first`);
      }

      // If both times provided, ensure check-out is after check-in
      if (data.checkedInAt && data.checkedOutAt) {
        const checkedInAt = new Date(data.checkedInAt);
        const checkedOutAt = new Date(data.checkedOutAt);

        if (checkedOutAt <= checkedInAt) {
          throw new Error(`Check-out time must be after check-in time`);
        }
      }

      // If only check-in provided but existing check-out exists, validate
      if (
        data.checkedInAt &&
        !data.checkedOutAt &&
        existingAssignment.checkedOutAt
      ) {
        const checkedInAt = new Date(data.checkedInAt);
        const checkedOutAt = new Date(existingAssignment.checkedOutAt);

        if (checkedOutAt <= checkedInAt) {
          throw new Error(
            `Check-in time must be before existing check-out time`,
          );
        }
      }

      // If only check-out provided, validate against existing check-in
      if (
        !data.checkedInAt &&
        data.checkedOutAt &&
        existingAssignment.checkedInAt
      ) {
        const checkedInAt = new Date(existingAssignment.checkedInAt);
        const checkedOutAt = new Date(data.checkedOutAt);

        if (checkedOutAt <= checkedInAt) {
          throw new Error(
            `Check-out time must be after existing check-in time`,
          );
        }
      }
    }

    // If declining, ensure reason is provided
    if (
      data.status === "declined" &&
      !data.declineReason &&
      !existingAssignment.declineReason
    ) {
      throw new Error(`Reason is required when declining an assignment`);
    }

    return this.repository.updateAssignment(id, data);
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    // Get the current assignment state
    const existingAssignment = await this.repository.findAssignmentById(id);

    if (!existingAssignment) {
      throw new Error(`Assignment with ID ${id} not found`);
    }

    // Get the schedule to check its status
    const schedule = await this.repository.findScheduleById(
      existingAssignment.scheduleId,
    );
    if (!schedule) {
      throw new Error(
        `Schedule with ID ${existingAssignment.scheduleId} not found`,
      );
    }

    // Check if schedule status allows deleting assignments
    if (schedule.status === ScheduleStatus.FINALIZED) {
      throw new Error(`Cannot delete assignments in a finalized schedule`);
    }

    return this.repository.deleteAssignment(id);
  }

  // Template methods

  /**
   * Get schedule templates for an organization
   */
  async getScheduleTemplates(
    organizationId: string,
  ): Promise<ScheduleTemplate[]> {
    // Validate organization exists
    const organization =
      await organizationService.getOrganizationById(organizationId);
    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    return this.repository.findScheduleTemplates(organizationId);
  }

  /**
   * Get schedule template by ID
   */
  async getScheduleTemplateById(id: string): Promise<ScheduleTemplate | null> {
    return this.repository.findScheduleTemplateById(id);
  }

  /**
   * Create a new schedule template
   */
  async createScheduleTemplate(
    data: CreateScheduleTemplateParams,
    createdById: string,
  ): Promise<ScheduleTemplate> {
    // Validate organization exists
    const organization = await organizationService.getOrganizationById(
      data.organizationId,
    );
    if (!organization) {
      throw new Error(`Organization with ID ${data.organizationId} not found`);
    }

    // If setting as default, check if any other template is default
    if (data.isDefault) {
      // This would normally update any existing default template
      // Not implemented in this placeholder version
    }

    return this.repository.createScheduleTemplate(data, createdById);
  }

  /**
   * Update an existing schedule template
   */
  async updateScheduleTemplate(
    id: string,
    data: UpdateScheduleTemplateParams,
  ): Promise<ScheduleTemplate> {
    // Get the current template state
    const existingTemplate = await this.repository.findScheduleTemplateById(id);

    if (!existingTemplate) {
      throw new Error(`Schedule template with ID ${id} not found`);
    }

    // If changing organization, validate it exists
    if (
      data.organizationId &&
      data.organizationId !== existingTemplate.organizationId
    ) {
      const organization = await organizationService.getOrganizationById(
        data.organizationId,
      );
      if (!organization) {
        throw new Error(
          `Organization with ID ${data.organizationId} not found`,
        );
      }
    }

    // If setting as default, check if any other template is default
    if (data.isDefault && !existingTemplate.isDefault) {
      // This would normally update any existing default template
      // Not implemented in this placeholder version
    }

    return this.repository.updateScheduleTemplate(id, data);
  }

  /**
   * Delete a schedule template
   */
  async deleteScheduleTemplate(id: string): Promise<void> {
    // Get the current template state
    const existingTemplate = await this.repository.findScheduleTemplateById(id);

    if (!existingTemplate) {
      throw new Error(`Schedule template with ID ${id} not found`);
    }

    return this.repository.deleteScheduleTemplate(id);
  }

  /**
   * Get shift templates for a schedule template
   */
  async getShiftTemplates(templateId: string): Promise<ShiftTemplate[]> {
    // Validate template exists
    const template = await this.repository.findScheduleTemplateById(templateId);
    if (!template) {
      throw new Error(`Schedule template with ID ${templateId} not found`);
    }

    return this.repository.findShiftTemplates(templateId);
  }

  /**
   * Create a new shift template
   */
  async createShiftTemplate(
    data: CreateShiftTemplateParams,
  ): Promise<ShiftTemplate> {
    // Validate template exists
    const template = await this.repository.findScheduleTemplateById(
      data.templateId,
    );
    if (!template) {
      throw new Error(`Schedule template with ID ${data.templateId} not found`);
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      throw new Error("Start time must be before end time");
    }

    // Production implementation - validate location exists in database
    if (data.locationId) {
      // This would check the location service once implemented
    }

    return this.repository.createShiftTemplate(data);
  }

  /**
   * Update an existing shift template
   */
  async updateShiftTemplate(
    id: string,
    data: UpdateShiftTemplateParams,
  ): Promise<ShiftTemplate> {
    // Get the current shift template state
    const existingTemplate = await this.repository.findShiftTemplateById(id);

    if (!existingTemplate) {
      throw new Error(`Shift template with ID ${id} not found`);
    }

    // Validate time range if changing times
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        throw new Error("Start time must be before end time");
      }
    } else if (data.startTime && !data.endTime) {
      if (data.startTime >= existingTemplate.endTime) {
        throw new Error("Start time must be before existing end time");
      }
    } else if (!data.startTime && data.endTime) {
      if (existingTemplate.startTime >= data.endTime) {
        throw new Error("Existing start time must be before end time");
      }
    }

    // Production implementation - validate location exists in database
    if (data.locationId) {
      // This would check the location service once implemented
    }

    return this.repository.updateShiftTemplate(id, data);
  }

  /**
   * Delete a shift template
   */
  async deleteShiftTemplate(id: string): Promise<void> {
    // Get the current shift template state
    const existingTemplate = await this.repository.findShiftTemplateById(id);

    if (!existingTemplate) {
      throw new Error(`Shift template with ID ${id} not found`);
    }

    return this.repository.deleteShiftTemplate(id);
  }

  /**
   * Apply a schedule template to create shifts for a schedule
   * This is a helper method, not directly exposed via API
   */
  private async applyTemplateToSchedule(
    template: ScheduleTemplate,
    scheduleId: string,
  ): Promise<void> {
    // Get the schedule
    const schedule = await this.repository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    // Get the shift templates
    const shiftTemplates = await this.repository.findShiftTemplates(
      template.id,
    );

    // Get the event start date to calculate shift dates
    const eventStartDate = new Date(schedule.startDate);

    // Create shifts for each template
    for (const shiftTemplate of shiftTemplates) {
      // Calculate the shift date based on the day offset
      const shiftDate = new Date(eventStartDate);
      shiftDate.setDate(shiftDate.getDate() + shiftTemplate.dayOffset);

      // Create the shift
      await this.repository.createShift({
        scheduleId,
        title: shiftTemplate.title,
        description: shiftTemplate.description,
        locationId: shiftTemplate.locationId,
        date: shiftDate.toISOString().split("T")[0], // YYYY-MM-DD format
        startTime: shiftTemplate.startTime,
        endTime: shiftTemplate.endTime,
        requiredStaffCount: shiftTemplate.requiredStaffCount,
        skillRequirements: shiftTemplate.skillRequirements,
        notes: shiftTemplate.notes,
      });
    }
  }
}
