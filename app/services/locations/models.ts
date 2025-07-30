/**
 * Location service models and validation schemas
 */
import { z } from &quot;zod&quot;;

// Location Types
export enum LocationType {
  VENUE = &quot;venue&quot;,
  OFFICE = &quot;office&quot;,
  STORAGE = &quot;storage&quot;,
  OTHER = &quot;other&quot;,
}

// Location Status
export enum LocationStatus {
  DRAFT = &quot;draft&quot;,
  PENDING = &quot;pending&quot;,
  APPROVED = &quot;approved&quot;,
  REJECTED = &quot;rejected&quot;,
  INACTIVE = &quot;inactive&quot;,
}

// State entity
export interface StateEntity {
  id: string;
  name: string;
  abbreviation: string;
}

// User entity (minimal for requester info)
export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
}

// Location DTO - Data Transfer Object
export interface LocationDTO {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  state?: StateEntity | undefined; // Explicitly make state optional
  zipcode: string;
  type: LocationType;
  status: LocationStatus;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number | undefined; // Make explicitly optional with undefined
  longitude?: number | undefined; // Make explicitly optional with undefined
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  requester?: UserEntity | undefined; // Explicitly make requester optional

  // Allow string indexing for table column access
  [key: string]: any;
}

// Create Location Parameters Schema
export const createLocationSchema = z.object({
  name: z.string().min(1, &quot;Name is required&quot;),
  type: z.nativeEnum(LocationType),
  address1: z.string().min(1, &quot;Address line 1 is required&quot;),
  address2: z.string().optional(),
  city: z.string().min(1, &quot;City is required&quot;),
  stateId: z.string().min(1, &quot;State is required&quot;),
  zipcode: z.string().min(5, &quot;Zipcode is required&quot;),
  phone: z.string().optional(),
  email: z.string().email(&quot;Invalid email&quot;).optional(),
  website: z.string().url(&quot;Invalid website URL&quot;).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email(&quot;Invalid email&quot;).optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Update Location Parameters Schema - same as create but all fields optional
export const updateLocationSchema = createLocationSchema
  .extend({
    status: z.nativeEnum(LocationStatus).optional(),
    rejectionReason: z.string().optional(),
  })
  .partial();

// Type definitions derived from schemas
export type CreateLocationParams = z.infer<typeof createLocationSchema>;
export type UpdateLocationParams = z.infer<typeof updateLocationSchema>;

// Additional parameter types for service methods
export interface ApproveLocationParams {
  id: string;
}

export interface RejectLocationParams {
  id: string;
  reason?: string | undefined;
}
