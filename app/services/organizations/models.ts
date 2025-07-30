/**
 * Organization Service Models
 * These models define the core entities and types for organization management
 */
import { z } from &quot;zod&quot;;

/**
 * Organization types
 */
export enum OrganizationType {
  INTERNAL = &quot;internal&quot;, // Rishi internal staff
  CLIENT = &quot;client&quot;, // Client organizations
  PARTNER = &quot;partner&quot;, // Partner organizations
}

/**
 * Client organization tiers
 */
export enum ClientTier {
  TIER_1 = &quot;tier_1&quot;, // Staff leasing
  TIER_2 = &quot;tier_2&quot;, // Full-service event staffing
  TIER_3 = &quot;tier_3&quot;, // White-label
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
  name: z.string().min(1, &quot;Organization name is required&quot;),
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
  organizationId: z.string().min(1, &quot;Organization ID is required&quot;),
  userId: z.string().min(1, &quot;User ID is required&quot;),
  roleId: z.string().min(1, &quot;Role ID is required&quot;),
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
