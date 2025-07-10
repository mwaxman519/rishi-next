/**
 * Kit Management Repository
 * Responsible for data access operations related to kit templates, kits, and kit assignments
 */
import { db } from "../../../server/db";
import {
  kitTemplates,
  kits,
  brands,
  users,
  activityKits,
  activities,
} from "../../../shared/schema";
import { eq, and, or, desc, like, asc, sql } from "drizzle-orm";

import {
  KitTemplateDTO,
  KitDTO,
  ActivityKitDTO,
  CreateKitTemplateParams,
  UpdateKitTemplateParams,
  CreateKitParams,
  UpdateKitParams,
  KitTemplateStatus,
  KitStatus,
} from "./models";
import { v4 as uuidv4 } from "uuid";

export class KitRepository {
  /**
   * Find all kit templates with optional filtering
   */
  async findAllTemplates(
    filters: Record<string, any> = {},
  ): Promise<KitTemplateDTO[]> {
    try {
      // Build query filters
      const queryFilters = [];

      if (filters.organizationId) {
        queryFilters.push(
          eq(kitTemplates.organization_id, filters.organizationId),
        );
      }

      if (filters.brandId) {
        queryFilters.push(eq(kitTemplates.brand_id, filters.brandId));
      }

      if (filters.status) {
        queryFilters.push(eq(kitTemplates.approval_status, filters.status));
      }

      if (filters.active !== undefined) {
        queryFilters.push(eq(kitTemplates.active, filters.active));
      }

      if (filters.search) {
        queryFilters.push(
          or(
            like(kitTemplates.name, `%${filters.search}%`),
            like(kitTemplates.description || "", `%${filters.search}%`),
          ),
        );
      }

      // Execute query with relations - use simpler join approach
      const templatesData = await db
        .select()
        .from(kitTemplates)
        .where(queryFilters.length > 0 ? and(...queryFilters) : undefined)
        .orderBy(desc(kitTemplates.created_at));

      // Map to DTOs
      return templatesData.map((row) => this.mapToTemplateDTO(row));
    } catch (error) {
      console.error("Error finding kit templates:", error);
      throw new Error(
        `Failed to find kit templates: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find kit template by ID
   */
  async findTemplateById(id: number | string): Promise<KitTemplateDTO | null> {
    try {
      // For UUID fields, we don't need to convert to number
      const templateId = id.toString();

      const [templateData] = await db
        .select()
        .from(kitTemplates)
        .leftJoin(brands, eq(kitTemplates.brand_id, brands.id))
        .where(eq(kitTemplates.id, templateId));

      return templateData ? this.mapToTemplateDTO(templateData) : null;
    } catch (error) {
      console.error(`Error finding kit template with ID ${id}:`, error);
      throw new Error(
        `Failed to find kit template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new kit template
   */
  async createTemplate(
    data: CreateKitTemplateParams,
    userId: string,
  ): Promise<KitTemplateDTO> {
    try {
      const [template] = await db
        .insert(kitTemplates)
        .values({
          ...data,
          requested_by_id: userId,
          approval_status: KitTemplateStatus.PENDING,
          active: true,
        })
        .returning();

      if (!template) {
        throw new Error("Failed to create kit template: No template returned");
      }

      return this.findTemplateById(template.id) as Promise<KitTemplateDTO>;
    } catch (error) {
      console.error("Error creating kit template:", error);
      throw new Error(
        `Failed to create kit template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing kit template
   */
  async updateTemplate(
    id: number | string,
    data: UpdateKitTemplateParams,
  ): Promise<KitTemplateDTO> {
    try {
      // For UUID fields, we don't need to convert to number
      const templateId = id.toString();

      // Create update data object, transforming any camelCase to snake_case
      const updateData: Record<string, any> = {
        updated_at: new Date(),
      };

      if (data.name) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.organization_id)
        updateData.organization_id = data.organization_id;
      if (data.brand_id) updateData.brand_id = data.brand_id;
      if (data.components) updateData.components = data.components;
      if (data.instructions !== undefined)
        updateData.instructions = data.instructions;

      // Handle specific approval fields with snake_case
      if (data.approval_status)
        updateData.approval_status = data.approval_status;
      if (data.approval_notes) updateData.approval_notes = data.approval_notes;

      await db
        .update(kitTemplates)
        .set(updateData)
        .where(eq(kitTemplates.id, templateId));

      return this.findTemplateById(templateId) as Promise<KitTemplateDTO>;
    } catch (error) {
      console.error(`Error updating kit template with ID ${id}:`, error);
      throw new Error(
        `Failed to update kit template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Approve a kit template
   */
  async approveTemplate(
    id: number | string,
    userId: string,
    notes?: string,
  ): Promise<KitTemplateDTO> {
    try {
      // For UUID fields, we don't need to convert to number
      const templateId = id.toString();

      await db
        .update(kitTemplates)
        .set({
          approval_status: KitTemplateStatus.APPROVED,
          approved_by_id: userId,
          approval_date: new Date(),
          approval_notes: notes,
          updated_at: new Date(),
        })
        .where(eq(kitTemplates.id, templateId));

      return this.findTemplateById(templateId) as Promise<KitTemplateDTO>;
    } catch (error) {
      console.error(`Error approving kit template with ID ${id}:`, error);
      throw new Error(
        `Failed to approve kit template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Reject a kit template
   */
  async rejectTemplate(
    id: number | string,
    userId: string,
    reason: string,
  ): Promise<KitTemplateDTO> {
    try {
      // For UUID fields, we don't need to convert to number
      const templateId = id.toString();

      await db
        .update(kitTemplates)
        .set({
          approval_status: KitTemplateStatus.REJECTED,
          approved_by_id: userId,
          approval_date: new Date(),
          approval_notes: reason,
          updated_at: new Date(),
        })
        .where(eq(kitTemplates.id, templateId));

      return this.findTemplateById(templateId) as Promise<KitTemplateDTO>;
    } catch (error) {
      console.error(`Error rejecting kit template with ID ${id}:`, error);
      throw new Error(
        `Failed to reject kit template: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find all kits with optional filtering
   */
  async findAllKits(filters: Record<string, any> = {}): Promise<KitDTO[]> {
    try {
      // Build query filters
      const queryFilters = [];

      if (filters.locationId) {
        queryFilters.push(eq(kits.location_id, filters.locationId));
      }

      if (filters.organizationId) {
        queryFilters.push(eq(kits.organization_id, filters.organizationId));
      }

      if (filters.templateId) {
        queryFilters.push(eq(kits.template_id, filters.templateId));
      }

      if (filters.status) {
        queryFilters.push(eq(kits.status, filters.status));
      }

      if (filters.search) {
        queryFilters.push(
          or(
            like(kits.name, `%${filters.search}%`),
            like(kits.description || "", `%${filters.search}%`),
          ),
        );
      }

      // Execute query with relations - using simpler approach without aliases
      // For requested users and approved users, we'll handle those in the service layer
      const kitsData = await db
        .select()
        .from(kits)
        .leftJoin(kitTemplates, eq(kits.template_id, kitTemplates.id))
        .where(queryFilters.length > 0 ? and(...queryFilters) : undefined)
        .orderBy(desc(kits.created_at));

      // Map to DTOs
      return kitsData.map((row) => this.mapToKitDTO(row));
    } catch (error) {
      console.error("Error finding kits:", error);
      throw new Error(
        `Failed to find kits: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find kit by ID
   */
  async findKitById(id: string): Promise<KitDTO | null> {
    try {
      const [kitData] = await db
        .select()
        .from(kits)
        .leftJoin(kitTemplates, eq(kits.template_id, kitTemplates.id))
        .where(eq(kits.id, id));

      return kitData ? this.mapToKitDTO(kitData) : null;
    } catch (error) {
      console.error(`Error finding kit with ID ${id}:`, error);
      throw new Error(
        `Failed to find kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new kit
   */
  async createKit(data: CreateKitParams, userId: string): Promise<KitDTO> {
    try {
      // Get template to validate it exists
      const template = await this.findTemplateById(data.template_id);
      if (!template) {
        throw new Error(`Kit template with ID ${data.template_id} not found`);
      }

      const result = await db
        .insert(kits)
        .values({
          name: data.name,
          description: data.description,
          template_id: data.template_id,
          organization_id: data.organization_id,
          location_id: data.location_id,
          status: data.status || KitStatus.INACTIVE, // Use provided status or default to INACTIVE
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      const kit = result[0];
      if (!kit) {
        throw new Error(
          "Failed to create kit: No kit was returned after insertion",
        );
      }

      return this.findKitById(kit.id) as Promise<KitDTO>;
    } catch (error) {
      console.error("Error creating kit:", error);
      throw new Error(
        `Failed to create kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing kit
   */
  async updateKit(id: string, data: UpdateKitParams): Promise<KitDTO> {
    try {
      const updateData: Record<string, any> = {
        updated_at: new Date(),
      };

      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.status) updateData.status = data.status;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db.update(kits).set(updateData).where(eq(kits.id, id));

      return this.findKitById(id) as Promise<KitDTO>;
    } catch (error) {
      console.error(`Error updating kit with ID ${id}:`, error);
      throw new Error(
        `Failed to update kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Approve a kit
   */
  async approveKit(
    id: string,
    userId: string,
    notes?: string,
  ): Promise<KitDTO> {
    try {
      await db
        .update(kits)
        .set({
          status: KitStatus.ACTIVE,
          active: true,
          updated_at: new Date(),
        })
        .where(eq(kits.id, id));

      return this.findKitById(id) as Promise<KitDTO>;
    } catch (error) {
      console.error(`Error approving kit with ID ${id}:`, error);
      throw new Error(
        `Failed to approve kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Reject a kit
   */
  async rejectKit(id: string, userId: string, reason: string): Promise<KitDTO> {
    try {
      await db
        .update(kits)
        .set({
          status: KitStatus.INACTIVE,
          active: false,
          updated_at: new Date(),
        })
        .where(eq(kits.id, id));

      return this.findKitById(id) as Promise<KitDTO>;
    } catch (error) {
      console.error(`Error rejecting kit with ID ${id}:`, error);
      throw new Error(
        `Failed to reject kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find all activity kits with optional filtering
   */
  async findAllActivityKits(
    filters: Record<string, any> = {},
  ): Promise<ActivityKitDTO[]> {
    try {
      // Build query filters
      const queryFilters = [];

      if (filters.activity_id) {
        queryFilters.push(eq(activityKits.activity_id, filters.activity_id));
      }

      if (filters.kit_template_id) {
        queryFilters.push(
          eq(activityKits.kit_template_id, filters.kit_template_id),
        );
      }

      if (filters.kit_instance_id) {
        queryFilters.push(
          eq(activityKits.kit_instance_id, filters.kit_instance_id),
        );
      }

      if (filters.status) {
        queryFilters.push(eq(activityKits.status, filters.status));
      }

      if (filters.assigned_to_id) {
        queryFilters.push(
          eq(activityKits.assigned_to_id, filters.assigned_to_id),
        );
      }

      // Execute query with relations
      const activityKitsData = await db
        .select()
        .from(activityKits)
        .leftJoin(activities, eq(activityKits.activity_id, activities.id))
        .leftJoin(
          kitTemplates,
          eq(activityKits.kit_template_id, kitTemplates.id),
        )
        .leftJoin(kits, eq(activityKits.kit_instance_id, kits.id))
        .leftJoin(users, eq(activityKits.assigned_to_id, users.id))
        .where(queryFilters.length > 0 ? and(...queryFilters) : undefined)
        .orderBy(asc(activities.start_date), asc(activities.start_time));

      // Map to DTOs
      return activityKitsData.map((row) => this.mapToActivityKitDTO(row));
    } catch (error) {
      console.error("Error finding activity kits:", error);
      throw new Error(
        `Failed to find activity kits: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find activity kit by ID
   */
  async findActivityKitById(id: string): Promise<ActivityKitDTO | null> {
    try {
      const [activityKitData] = await db
        .select()
        .from(activityKits)
        .leftJoin(activities, eq(activityKits.activity_id, activities.id))
        .leftJoin(
          kitTemplates,
          eq(activityKits.kit_template_id, kitTemplates.id),
        )
        .leftJoin(kits, eq(activityKits.kit_instance_id, kits.id))
        .leftJoin(users, eq(activityKits.assigned_to_id, users.id))
        .where(eq(activityKits.id, id));

      return activityKitData ? this.mapToActivityKitDTO(activityKitData) : null;
    } catch (error) {
      console.error(`Error finding activity kit with ID ${id}:`, error);
      throw new Error(
        `Failed to find activity kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Create a new activity kit assignment
   */
  async createActivityKit(data: any): Promise<ActivityKitDTO> {
    try {
      const id = uuidv4();

      const result = await db
        .insert(activityKits)
        .values({
          id,
          ...data,
        })
        .returning();

      const activityKit = result[0];
      if (!activityKit) {
        throw new Error(
          "Failed to create activity kit: No activity kit was returned after insertion",
        );
      }

      return this.findActivityKitById(
        activityKit.id,
      ) as Promise<ActivityKitDTO>;
    } catch (error) {
      console.error("Error creating activity kit:", error);
      throw new Error(
        `Failed to create activity kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update an existing activity kit assignment
   */
  async updateActivityKit(id: string, data: any): Promise<ActivityKitDTO> {
    try {
      await db
        .update(activityKits)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(activityKits.id, id));

      return this.findActivityKitById(id) as Promise<ActivityKitDTO>;
    } catch (error) {
      console.error(`Error updating activity kit with ID ${id}:`, error);
      throw new Error(
        `Failed to update activity kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Delete an activity kit assignment
   */
  async deleteActivityKit(id: string): Promise<void> {
    try {
      await db.delete(activityKits).where(eq(activityKits.id, id));
    } catch (error) {
      console.error(`Error deleting activity kit with ID ${id}:`, error);
      throw new Error(
        `Failed to delete activity kit: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Helper function to map database row to KitTemplateDTO
   */
  private mapToTemplateDTO(row: any): KitTemplateDTO {
    const brandData = row.brands;
    const approverData = row.approved_by;
    const requesterData = row.requested_by;

    return {
      id: row.id || row.kit_templates?.id,
      name: row.name || row.kit_templates?.name,
      description: row.description || row.kit_templates?.description,
      organization_id:
        row.organization_id || row.kit_templates?.organization_id,
      brand_id: row.brand_id || row.kit_templates?.brand_id,
      brand: brandData
        ? {
            id: brandData.id,
            name: brandData.name,
            client_id: brandData.client_id,
            logo_url: brandData.logo_url,
          }
        : undefined,
      components: row.components || row.kit_templates?.components,
      instructions: row.instructions || row.kit_templates?.instructions,
      approval_status:
        row.approval_status || row.kit_templates?.approval_status,
      approved_by_id: row.approved_by_id || row.kit_templates?.approved_by_id,
      approved_by: approverData
        ? {
            id: approverData.id,
            fullName: approverData.fullName || approverData.full_name,
            email: approverData.email,
          }
        : undefined,
      approval_date: (
        row.approval_date || row.kit_templates?.approval_date
      )?.toISOString(),
      approval_notes: row.approval_notes || row.kit_templates?.approval_notes,
      requested_by_id:
        row.requested_by_id || row.kit_templates?.requested_by_id,
      requested_by: requesterData
        ? {
            id: requesterData.id,
            fullName: requesterData.fullName || requesterData.full_name,
            email: requesterData.email,
          }
        : undefined,
      active: row.active || row.kit_templates?.active,
      created_at: (
        row.created_at || row.kit_templates?.created_at
      )?.toISOString(),
      updated_at: (
        row.updated_at || row.kit_templates?.updated_at
      )?.toISOString(),
    };
  }

  /**
   * Helper function to map database row to KitDTO
   */
  private mapToKitDTO(row: any): KitDTO {
    // Extract properties from either the row itself (for direct queries) or from the kits property (for joins)
    const kitData = row.kits || row;
    const templateData = row.kit_templates;

    return {
      id: kitData.id,
      name: kitData.name,
      description: kitData.description || undefined,
      location_id: kitData.location_id,
      organization_id: kitData.organization_id,
      template_id: kitData.template_id,
      template: templateData
        ? {
            id: templateData.id,
            name: templateData.name,
            description: templateData.description,
            active: templateData.active,
            created_at: templateData.created_at?.toISOString(),
            updated_at: templateData.updated_at?.toISOString(),
          }
        : undefined,
      status: kitData.status,
      active: kitData.active,
      created_at: kitData.created_at?.toISOString(),
      updated_at: kitData.updated_at?.toISOString(),
    };
  }

  /**
   * Helper function to map database row to ActivityKitDTO
   */
  private mapToActivityKitDTO(row: any): ActivityKitDTO {
    // Extract properties from either the row itself (for direct queries) or from the activity_kits property (for joins)
    const activityKitData = row.activity_kits || row;
    const templateData = row.kit_templates;
    const kitData = row.kits;
    const userData = row.users;

    return {
      id: activityKitData.id,
      activity_id: activityKitData.activity_id,
      kit_template_id: activityKitData.kit_template_id,
      kitTemplate: templateData
        ? {
            id: templateData.id,
            name: templateData.name,
            description: templateData.description,
            active: templateData.active,
            created_at: templateData.created_at?.toISOString(),
            updated_at: templateData.updated_at?.toISOString(),
          }
        : undefined,
      kit_instance_id: activityKitData.kit_instance_id,
      kitInstance: kitData
        ? this.mapToKitDTO({ kits: kitData, kit_templates: row.kit_templates })
        : undefined,
      quantity: activityKitData.quantity,
      notes: activityKitData.notes,
      status: activityKitData.status,
      assigned_to_id: activityKitData.assigned_to_id,
      assignedTo: userData
        ? {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
          }
        : undefined,
      created_at: activityKitData.created_at?.toISOString(),
      updated_at: activityKitData.updated_at?.toISOString(),
    };
  }
}
