/**
 * Organization Service Models
 * These models define the core entities and types for organization management
 */
import { z } from "zod";

/**
 * Organization types
 */
export enum OrganizationType {
  INTERNAL = "internal", // Rishi internal staff
  CLIENT = "client", // Client organizations
  PARTNER = "partner", // Partner organizations
}

/**
 * Client organization tiers
 */
export enum ClientTier {
  TIER_1 = "tier_1", // Staff leasing
  TIER_2 = "tier_2", // Full-service event staffing
  TIER_3 = "tier_3", // White-label
}

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  tier?: ClientTier;
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  parentOrganizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Organization user association
 */
export interface OrganizationUser {
  organizationId: string;
  userId: string;
  roleId: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User's organization with role
 */
export interface UserOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  tier?: ClientTier;
  roleId: string;
  isDefault: boolean;
}

/**
 * Organization creation parameters
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  type: z.nativeEnum(OrganizationType),
  tier: z.nativeEnum(ClientTier).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
  parentOrganizationId: z.string().optional(),
});

/**
 * Organization update parameters
 */
export const updateOrganizationSchema = createOrganizationSchema.partial();

/**
 * Organization user association parameters
 */
export const organizationUserSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  isDefault: z.boolean().default(false),
});

/**
 * Organization filters for searching
 */
export interface OrganizationFilters {
  name?: string;
  type?: OrganizationType;
  tier?: ClientTier;
  isActive?: boolean;
  parentOrganizationId?: string;
}

// Types derived from schemas
export type CreateOrganizationParams = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationParams = z.infer<typeof updateOrganizationSchema>;
export type OrganizationUserParams = z.infer<typeof organizationUserSchema>;
