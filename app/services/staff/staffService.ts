/**
 * Staff Service - Core business logic for staff management
 */
import { StaffRepository } from &quot;./repository&quot;;
import {
  StaffMember,
  StaffSkill,
  StaffAvailability,
  TimeOffRequest,
  CreateStaffMemberParams,
  UpdateStaffMemberParams,
  CreateStaffSkillParams,
  UpdateStaffSkillParams,
  CreateAvailabilityParams,
  UpdateAvailabilityParams,
  CreateTimeOffRequestParams,
  UpdateTimeOffRequestParams,
  ApproveTimeOffRequestParams,
  RejectTimeOffRequestParams,
  StaffFilters,
  StaffStatus,
} from &quot;./models&quot;;
import { organizationService } from &quot;../organizations&quot;;
import { rbacService } from &quot;../rbac&quot;;

export class StaffService {
  private repository: StaffRepository;

  constructor() {
    this.repository = new StaffRepository();
  }

  /**
   * Get all staff members with optional filtering
   */
  async getAllStaffMembers(filters: StaffFilters = {}): Promise<StaffMember[]> {
    return this.repository.findAll(filters);
  }

  /**
   * Get staff member by ID
   */
  async getStaffMemberById(id: string): Promise<StaffMember | null> {
    return this.repository.findById(id);
  }

  /**
   * Get staff member by user ID
   */
  async getStaffMemberByUserId(userId: string): Promise<StaffMember | null> {
    return this.repository.findByUserId(userId);
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(data: CreateStaffMemberParams): Promise<StaffMember> {
    // Validate organization exists
    const organization = await organizationService.getOrganizationById(
      data.organizationId,
    );
    if (!organization) {
      throw new Error(`Organization with ID ${data.organizationId} not found`);
    }

    // Ensure user isn&apos;t already a staff member
    const existingStaff = await this.repository.findByUserId(data.userId);
    if (existingStaff) {
      throw new Error(`User with ID ${data.userId} is already a staff member`);
    }

    // Validate email format and uniqueness
    // This would be handled by Zod schema validation

    // Ensure hire date is not in the future
    const hireDate = new Date(data.hireDate);
    const today = new Date();
    if (hireDate > today) {
      throw new Error(&quot;Hire date cannot be in the future&quot;);
    }

    return this.repository.create(data);
  }

  /**
   * Update an existing staff member
   */
  async updateStaffMember(
    id: string,
    data: UpdateStaffMemberParams,
  ): Promise<StaffMember> {
    // Get the current staff member state
    const existingStaff = await this.repository.findById(id);

    if (!existingStaff) {
      throw new Error(`Staff member with ID ${id} not found`);
    }

    // Validate organization if changing
    if (
      data.organizationId &&
      data.organizationId !== existingStaff.organizationId
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

    // Validate dates if provided
    if (data.hireDate) {
      const hireDate = new Date(data.hireDate);
      const today = new Date();
      if (hireDate > today) {
        throw new Error(&quot;Hire date cannot be in the future&quot;);
      }
    }

    if (data.terminationDate) {
      const terminationDate = new Date(data.terminationDate);
      const hireDate = new Date(data.hireDate || existingStaff.hireDate);

      if (terminationDate < hireDate) {
        throw new Error(&quot;Termination date cannot be before hire date&quot;);
      }
    }

    // If status is changing to TERMINATED, ensure termination date is provided
    if (
      data.status === StaffStatus.TERMINATED &&
      !data.terminationDate &&
      !existingStaff.terminationDate
    ) {
      throw new Error(
        &quot;Termination date is required when setting status to TERMINATED&quot;,
      );
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a staff member (usually just marks as inactive)
   */
  async deleteStaffMember(id: string): Promise<void> {
    // Get the current staff member state
    const existingStaff = await this.repository.findById(id);

    if (!existingStaff) {
      throw new Error(`Staff member with ID ${id} not found`);
    }

    return this.repository.delete(id);
  }

  /**
   * Change staff member status
   */
  async changeStaffStatus(
    id: string,
    status: StaffStatus,
    terminationDate?: string,
  ): Promise<StaffMember> {
    // Get the current staff member state
    const existingStaff = await this.repository.findById(id);

    if (!existingStaff) {
      throw new Error(`Staff member with ID ${id} not found`);
    }

    // If changing to TERMINATED, ensure termination date is provided
    if (
      status === StaffStatus.TERMINATED &&
      !terminationDate &&
      !existingStaff.terminationDate
    ) {
      throw new Error(
        &quot;Termination date is required when setting status to TERMINATED&quot;,
      );
    }

    // If termination date provided, validate it
    if (terminationDate) {
      const terminationDateObj = new Date(terminationDate);
      const hireDateObj = new Date(existingStaff.hireDate);

      if (terminationDateObj < hireDateObj) {
        throw new Error(&quot;Termination date cannot be before hire date&quot;);
      }
    }

    return this.repository.changeStatus(id, status, terminationDate);
  }

  /**
   * Skills methods
   */
  async getStaffSkills(staffId: string): Promise<StaffSkill[]> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    return this.repository.getSkillsForStaff(staffId);
  }

  async addStaffSkill(data: CreateStaffSkillParams): Promise<StaffSkill> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(data.staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${data.staffId} not found`);
    }

    // Validate skill exists (would need a skills service or repository)
    // Assuming this would be handled when implemented

    // Validate certification dates if provided
    if (data.certificationDate && data.certificationExpiry) {
      const certDate = new Date(data.certificationDate);
      const expiryDate = new Date(data.certificationExpiry);

      if (expiryDate <= certDate) {
        throw new Error(
          &quot;Certification expiry date must be after certification date&quot;,
        );
      }
    }

    return this.repository.addSkill(data);
  }

  async updateStaffSkill(
    id: string,
    data: UpdateStaffSkillParams,
  ): Promise<StaffSkill> {
    // Validation logic similar to addition would go here
    return this.repository.updateSkill(id, data);
  }

  async removeStaffSkill(id: string): Promise<void> {
    return this.repository.removeSkill(id);
  }

  /**
   * Availability methods
   */
  async getStaffAvailability(staffId: string): Promise<StaffAvailability[]> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    return this.repository.getAvailabilityForStaff(staffId);
  }

  async addStaffAvailability(
    data: CreateAvailabilityParams,
  ): Promise<StaffAvailability> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(data.staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${data.staffId} not found`);
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      throw new Error(&quot;Start time must be before end time&quot;);
    }

    return this.repository.addAvailability(data);
  }

  async updateStaffAvailability(
    id: string,
    data: UpdateAvailabilityParams,
  ): Promise<StaffAvailability> {
    // Validation logic similar to addition would go here
    return this.repository.updateAvailability(id, data);
  }

  async removeStaffAvailability(id: string): Promise<void> {
    return this.repository.removeAvailability(id);
  }

  /**
   * Time off request methods
   */
  async getTimeOffRequests(staffId: string): Promise<TimeOffRequest[]> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    return this.repository.getTimeOffRequestsForStaff(staffId);
  }

  async createTimeOffRequest(
    data: CreateTimeOffRequestParams,
  ): Promise<TimeOffRequest> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(data.staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${data.staffId} not found`);
    }

    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      throw new Error(&quot;Start date must be before or equal to end date&quot;);
    }

    // Validate not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    if (startDate < today) {
      throw new Error(&quot;Time off requests cannot start in the past&quot;);
    }

    return this.repository.createTimeOffRequest(data);
  }

  async updateTimeOffRequest(
    id: string,
    data: UpdateTimeOffRequestParams,
  ): Promise<TimeOffRequest> {
    // Validation logic similar to creation would go here
    return this.repository.updateTimeOffRequest(id, data);
  }

  async approveTimeOffRequest(
    params: ApproveTimeOffRequestParams,
    reviewerId: string,
  ): Promise<TimeOffRequest> {
    // Validate reviewer has permission to approve requests
    // This would be handled by RBAC checks in the API route

    return this.repository.approveTimeOffRequest(
      params.id,
      reviewerId,
      params.notes,
    );
  }

  async rejectTimeOffRequest(
    params: RejectTimeOffRequestParams,
    reviewerId: string,
  ): Promise<TimeOffRequest> {
    // Validate reviewer has permission to reject requests
    // This would be handled by RBAC checks in the API route

    return this.repository.rejectTimeOffRequest(
      params.id,
      reviewerId,
      params.rejectionReason,
      params.notes,
    );
  }

  async cancelTimeOffRequest(id: string): Promise<TimeOffRequest> {
    return this.repository.cancelTimeOffRequest(id);
  }

  /**
   * Check if staff member is available for a specific time slot
   */
  async isStaffAvailable(
    staffId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    // Validate staff member exists
    const staffMember = await this.repository.findById(staffId);
    if (!staffMember) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }

    // Check if staff status allows availability
    if (
      staffMember.status === StaffStatus.INACTIVE ||
      staffMember.status === StaffStatus.SUSPENDED ||
      staffMember.status === StaffStatus.TERMINATED
    ) {
      return false;
    }

    // Parse the date to get day of week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get all availabilities for the staff member
    const availabilities =
      await this.repository.getAvailabilityForStaff(staffId);

    // Check if available based on regular schedule
    const hasAvailabilityForDay = availabilities.some(
      (a) =>
        a.dayOfWeek === dayOfWeek &&
        a.isAvailable &&
        a.startTime <= startTime &&
        a.endTime >= endTime,
    );

    if (!hasAvailabilityForDay) {
      return false;
    }

    // Check for any time off requests that overlap
    const timeOffRequests =
      await this.repository.getTimeOffRequestsForStaff(staffId);

    const hasOverlappingTimeOff = timeOffRequests.some((request) => {
      if (request.status !== &quot;approved&quot;) {
        return false;
      }

      const requestStartDate = new Date(request.startDate);
      const requestEndDate = new Date(request.endDate);

      // Set times to start and end of day for comparison
      requestStartDate.setHours(0, 0, 0, 0);
      requestEndDate.setHours(23, 59, 59, 999);

      // Check if date falls within time off period
      return dateObj >= requestStartDate && dateObj <= requestEndDate;
    });

    return !hasOverlappingTimeOff;
  }
}
