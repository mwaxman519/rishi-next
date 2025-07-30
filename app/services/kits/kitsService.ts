/**
 * Kit Management Service - Business logic for kit management and assignments
 */
import { KitRepository } from &quot;./repository&quot;;
import {
  KitTemplateDTO,
  KitDTO,
  ActivityKitDTO,
  CreateKitTemplateParams,
  UpdateKitTemplateParams,
  CreateKitParams,
  UpdateKitParams,
  CreateActivityKitParams,
  UpdateActivityKitParams,
  ApproveKitTemplateParams,
  RejectKitTemplateParams,
  ApproveKitParams,
  RejectKitParams,
  createKitTemplateSchema,
  updateKitTemplateSchema,
  createKitSchema,
  updateKitSchema,
  createActivityKitSchema,
  updateActivityKitSchema,
  KitTemplateStatus,
  KitStatus,
} from &quot;./models&quot;;

export class KitsService {
  private repository: KitRepository;

  constructor(repository: KitRepository) {
    this.repository = repository;
  }

  /**
   * Get all kit templates with optional filtering
   */
  async getAllTemplates(
    filters?: Record<string, any>,
  ): Promise<KitTemplateDTO[]> {
    return this.repository.findAllTemplates(filters);
  }

  /**
   * Get a kit template by ID
   */
  async getTemplateById(id: string): Promise<KitTemplateDTO | null> {
    return this.repository.findTemplateById(id);
  }

  /**
   * Create a new kit template
   */
  async createTemplate(
    params: CreateKitTemplateParams,
    userId: string,
  ): Promise<KitTemplateDTO> {
    // Validate parameters using zod schema
    const validatedParams = createKitTemplateSchema.parse(params);

    // Create template in database
    return this.repository.createTemplate(validatedParams, userId);
  }

  /**
   * Update an existing kit template
   */
  async updateTemplate(
    id: string,
    params: UpdateKitTemplateParams,
    userId: string,
  ): Promise<KitTemplateDTO> {
    // Validate parameters using zod schema
    const validatedParams = updateKitTemplateSchema.parse(params);

    // Check if template exists
    const template = await this.repository.findTemplateById(id);
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }

    // Prevent updating approved templates
    if (
      template.approval_status === KitTemplateStatus.APPROVED &&
      !params.approval_status &&
      !validatedParams.active
    ) {
      throw new Error(
        &quot;Cannot update an approved template except for its active status&quot;,
      );
    }

    // Only allow admins/managers to change approval status
    if (
      params.approval_status &&
      params.approval_status !== template.approval_status
    ) {
      // In a real implementation, we'd check permissions here
      // For now, we'll just pass the approval status through
    }

    // Update template in database
    return this.repository.updateTemplate(id, validatedParams);
  }

  /**
   * Approve a kit template
   */
  async approveTemplate(
    params: ApproveKitTemplateParams,
    userId: string,
  ): Promise<KitTemplateDTO> {
    const { id, notes } = params;
    // Convert id to string if it&apos;s a number
    const templateId = id.toString();

    // Check if template exists
    const template = await this.repository.findTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Check template status
    if (template.approval_status === KitTemplateStatus.APPROVED) {
      throw new Error(&quot;Template is already approved&quot;);
    }

    // Approve template in database
    return this.repository.approveTemplate(templateId, userId, notes);
  }

  /**
   * Reject a kit template
   */
  async rejectTemplate(
    params: RejectKitTemplateParams,
    userId: string,
  ): Promise<KitTemplateDTO> {
    const { id, reason } = params;
    // Convert id to string if it&apos;s a number
    const templateId = id.toString();

    // Check if template exists
    const template = await this.repository.findTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Check template status
    if (template.approval_status === KitTemplateStatus.REJECTED) {
      throw new Error(&quot;Template is already rejected&quot;);
    }

    // A reason is required for rejection
    if (!reason) {
      throw new Error(&quot;A reason must be provided when rejecting a template&quot;);
    }

    // Reject template in database
    return this.repository.rejectTemplate(templateId, userId, reason);
  }

  /**
   * Get all kits with optional filtering
   */
  async getAllKits(filters?: Record<string, any>): Promise<KitDTO[]> {
    return this.repository.findAllKits(filters);
  }

  /**
   * Get a kit by ID
   */
  async getKitById(id: string): Promise<KitDTO | null> {
    return this.repository.findKitById(id);
  }

  /**
   * Create a new kit
   */
  async createKit(params: CreateKitParams, userId: string): Promise<KitDTO> {
    // Validate parameters using zod schema
    const validatedParams = createKitSchema.parse(params);

    // Check if template exists and is approved
    // Ensure template_id is a string
    const templateId = validatedParams.template_id;
    if (!templateId) {
      throw new Error(&quot;Template ID is required&quot;);
    }

    const template = await this.repository.findTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    if (template.approval_status !== KitTemplateStatus.APPROVED) {
      throw new Error(
        &quot;Cannot create a kit from a template that is not approved&quot;,
      );
    }

    // Create kit in database with proper status
    const kitParams = {
      ...validatedParams,
      status: KitStatus.INACTIVE, // Start as inactive until approved
    };

    return this.repository.createKit(kitParams, userId);
  }

  /**
   * Update an existing kit
   */
  async updateKit(
    id: string,
    params: UpdateKitParams,
    userId: string,
  ): Promise<KitDTO> {
    // Validate parameters using zod schema
    const validatedParams = updateKitSchema.parse(params);

    // Check if kit exists
    const kit = await this.repository.findKitById(id);
    if (!kit) {
      throw new Error(`Kit with ID ${id} not found`);
    }

    // Only allow updating status field for active kits
    if (kit.active && kit.status === KitStatus.ACTIVE && !params.status) {
      throw new Error(&quot;Cannot update an active kit except for its status&quot;);
    }

    // Update kit in database
    return this.repository.updateKit(id, validatedParams);
  }

  /**
   * Approve a kit
   */
  async approveKit(params: ApproveKitParams, userId: string): Promise<KitDTO> {
    const { id, notes } = params;
    // Convert id to string if it&apos;s a number
    const kitId = id.toString();

    // Check if kit exists
    const kit = await this.repository.findKitById(kitId);
    if (!kit) {
      throw new Error(`Kit with ID ${kitId} not found`);
    }

    // Check kit status
    if (kit.status === KitStatus.ACTIVE) {
      throw new Error(&quot;Kit is already active&quot;);
    }

    // Approve kit in database
    return this.repository.approveKit(kitId, userId, notes);
  }

  /**
   * Reject a kit
   */
  async rejectKit(params: RejectKitParams, userId: string): Promise<KitDTO> {
    const { id, reason } = params;
    // Convert id to string if it&apos;s a number
    const kitId = id.toString();

    // Check if kit exists
    const kit = await this.repository.findKitById(kitId);
    if (!kit) {
      throw new Error(`Kit with ID ${kitId} not found`);
    }

    // Check kit status
    if (kit.status === KitStatus.RETIRED || kit.status === KitStatus.DAMAGED) {
      throw new Error(`Kit is already in ${kit.status} status`);
    }

    // A reason is required for rejection
    if (!reason) {
      throw new Error(&quot;A reason must be provided when rejecting a kit&quot;);
    }

    // Reject kit in database
    return this.repository.rejectKit(kitId, userId, reason);
  }

  /**
   * Get all activity kit assignments with optional filtering
   */
  async getAllActivityKits(
    filters?: Record<string, any>,
  ): Promise<ActivityKitDTO[]> {
    return this.repository.findAllActivityKits(filters);
  }

  /**
   * Get an activity kit assignment by ID
   */
  async getActivityKitById(id: string): Promise<ActivityKitDTO | null> {
    return this.repository.findActivityKitById(id);
  }

  /**
   * Create a new activity kit assignment
   */
  async createActivityKit(
    params: CreateActivityKitParams,
  ): Promise<ActivityKitDTO> {
    // Validate parameters using zod schema
    const validatedParams = createActivityKitSchema.parse(params);

    // Either kit template or kit instance is required
    if (!validatedParams.kit_template_id && !validatedParams.kit_instance_id) {
      throw new Error(
        &quot;Either kit_template_id or kit_instance_id must be provided&quot;,
      );
    }

    // Check if kit_instance_id exists
    if (validatedParams.kit_instance_id) {
      // Ensure the ID is a string
      const kitId = validatedParams.kit_instance_id.toString();

      const kit = await this.repository.findKitById(kitId);
      if (!kit) {
        throw new Error(`Kit with ID ${kitId} not found`);
      }

      // Check if kit status is active
      if (kit.status !== KitStatus.ACTIVE) {
        throw new Error(&quot;Cannot assign a kit that is not active&quot;);
      }
    }

    // Check if kit_template_id exists
    if (validatedParams.kit_template_id) {
      // Ensure the ID is a string
      const templateId = validatedParams.kit_template_id.toString();

      const template = await this.repository.findTemplateById(templateId);
      if (!template) {
        throw new Error(`Kit template with ID ${templateId} not found`);
      }

      // Check if template is approved
      if (template.approval_status !== KitTemplateStatus.APPROVED) {
        throw new Error(&quot;Cannot assign a kit template that is not approved&quot;);
      }
    }

    // Create activity kit in database
    return this.repository.createActivityKit(validatedParams);
  }

  /**
   * Update an existing activity kit assignment
   */
  async updateActivityKit(
    id: string,
    params: UpdateActivityKitParams,
  ): Promise<ActivityKitDTO> {
    // Validate parameters using zod schema
    const validatedParams = updateActivityKitSchema.parse(params);

    // Check if activity kit exists
    const activityKit = await this.repository.findActivityKitById(id);
    if (!activityKit) {
      throw new Error(`Activity kit with ID ${id} not found`);
    }

    // Update activity kit in database
    return this.repository.updateActivityKit(id, validatedParams);
  }

  /**
   * Delete an activity kit assignment
   */
  async deleteActivityKit(id: string): Promise<void> {
    // Check if activity kit exists
    const activityKit = await this.repository.findActivityKitById(id);
    if (!activityKit) {
      throw new Error(`Activity kit with ID ${id} not found`);
    }

    // Delete activity kit from database
    await this.repository.deleteActivityKit(id);
  }
}
