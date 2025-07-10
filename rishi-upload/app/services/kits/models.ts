/**
 * Kit Management Service Models
 */
import { z } from "zod";

// Kit Template Status
export enum KitTemplateStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Kit Status
export enum KitStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DAMAGED = "damaged",
  LOST = "lost",
  RETIRED = "retired",
}

// Kit Assignment Status
export enum KitAssignmentStatus {
  NEEDED = "needed",
  ALLOCATED = "allocated",
  PREPARED = "prepared",
  DELIVERED = "delivered",
  RETURNED = "returned",
}

// Component type enum for kit components
export enum ComponentType {
  HARDWARE = "hardware",
  MATERIAL = "material",
  DISPLAY = "display",
  MERCHANDISE = "merchandise",
  PROMOTIONAL = "promotional",
  LITERATURE = "literature",
  OTHER = "other",
}

// Component DTO
export interface ComponentDTO {
  id: string;
  name: string;
  type: ComponentType;
  description?: string;
  quantity: number;
  unitCost?: number;
  imageUrl?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  notes?: string;
  isRequired: boolean;
}

// Brand entity type for display purposes
export interface BrandEntity {
  id: string;
  name: string;
  client_id?: string | undefined;
  logo_url?: string | undefined;
}

// User entity (minimal for requester/approver info)
export interface UserEntity {
  id: string;
  full_name: string;
  email: string;
}

// Kit Template DTO
export interface KitTemplateDTO {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  organization_id?: string;
  brand_id?: string;
  brand?: BrandEntity | undefined;
  components?: ComponentDTO[];
  instructions?: string;
  approval_status?: string;
  approved_by_id?: string;
  approved_by?: UserEntity | undefined;
  approval_date?: string | Date;
  approval_notes?: string;
  requested_by_id?: string;
  requested_by?: UserEntity | undefined;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Kit Template reference (minimal) for embedded usage
export interface KitTemplateRef {
  id: string;
  name: string;
  description?: string | undefined;
  active: boolean;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

// Kit DTO
export interface KitDTO {
  id: string;
  name: string;
  description?: string | undefined;
  status: string;
  active: boolean;
  organization_id?: string | undefined;
  location_id?: string | undefined;
  template_id?: string | undefined;
  notes?: string | undefined;
  created_at?: string | Date | undefined;
  updated_at?: string | Date | undefined;
  template?: KitTemplateRef | undefined;
}

// Activity Kit DTO
export interface ActivityKitDTO {
  id: string;
  activity_id: string;
  kit_template_id?: string | undefined;
  kitTemplate?: KitTemplateRef | undefined;
  kit_instance_id?: string | undefined;
  kitInstance?: KitDTO | undefined;
  quantity: number;
  notes?: string | undefined;
  status: string;
  assigned_to_id?: string | undefined;
  assignedTo?: UserEntity | undefined;
  created_at: string;
  updated_at: string;
}

// Create Kit Template Parameters Schema
export const createKitTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  organization_id: z.string().optional(),
  brand_id: z.string().optional(),
  components: z
    .array(
      z.object({
        name: z.string().min(1, "Component name is required"),
        type: z.nativeEnum(ComponentType),
        description: z.string().optional(),
        quantity: z.number().int().positive("Quantity must be positive"),
        unitCost: z.number().optional(),
        imageUrl: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        weight: z.number().optional(),
        dimensions: z.string().optional(),
        notes: z.string().optional(),
        isRequired: z.boolean().default(true),
      }),
    )
    .min(1, "At least one component is required"),
  instructions: z.string().optional(),
});

// Update Kit Template Parameters Schema
export const updateKitTemplateSchema = createKitTemplateSchema
  .extend({
    active: z.boolean().optional(),
    approval_status: z.nativeEnum(KitTemplateStatus).optional(),
    approval_notes: z.string().optional(),
  })
  .partial();

// Create Kit Parameters Schema
export const createKitSchema = z.object({
  name: z.string().min(1, "Kit name is required"),
  description: z.string().optional(),
  organization_id: z.string().min(1, "Organization is required"),
  location_id: z.string().min(1, "Location is required"),
  template_id: z.string().min(1, "Template is required"),
  notes: z.string().optional(),
  status: z.nativeEnum(KitStatus).optional(),
});

// Update Kit Parameters Schema
export const updateKitSchema = createKitSchema
  .extend({
    status: z.nativeEnum(KitStatus).optional(),
    active: z.boolean().optional(),
  })
  .partial();

// Create Activity Kit Parameters Schema
export const createActivityKitSchema = z.object({
  activity_id: z.string().min(1, "Activity ID is required"),
  kit_template_id: z.string().optional(),
  kit_instance_id: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional(),
  status: z.nativeEnum(KitAssignmentStatus).default(KitAssignmentStatus.NEEDED),
  assigned_to_id: z.string().optional(),
});

// Update Activity Kit Parameters Schema
export const updateActivityKitSchema = createActivityKitSchema
  .extend({})
  .partial();

// Type definitions derived from schemas
export type CreateKitTemplateParams = z.infer<typeof createKitTemplateSchema>;
export type UpdateKitTemplateParams = z.infer<typeof updateKitTemplateSchema>;
export type CreateKitParams = z.infer<typeof createKitSchema>;
export type UpdateKitParams = z.infer<typeof updateKitSchema>;
export type CreateActivityKitParams = z.infer<typeof createActivityKitSchema>;
export type UpdateActivityKitParams = z.infer<typeof updateActivityKitSchema>;

// Additional parameter types for service methods
export interface ApproveKitTemplateParams {
  id: number;
  notes?: string;
}

export interface RejectKitTemplateParams {
  id: number;
  reason: string;
}

export interface ApproveKitParams {
  id: number;
  notes?: string;
}

export interface RejectKitParams {
  id: number;
  reason: string;
}
