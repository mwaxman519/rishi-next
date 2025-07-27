/**
 * Location related types for the application
 * Compatible with the service models
 */
import { StateEntity } from "@/services/locations/models";

// Re-export types from the LocationType and LocationStatus enums
export type LocationType = "venue" | "office" | "storage" | "other";
export type LocationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "inactive";

// Compatible with StateEntity from services
export interface StateDTO {
  id: string;
  name: string;
  abbreviation: string;
  country?: string;
}

// Compatible with LocationDTO from services
export interface LocationDTO {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateId?: string;
  state?: StateEntity | StateDTO; // Accept both types
  zipcode: string;
  type: string | LocationType;
  status: string | LocationStatus;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  requester?: {
    id: string;
    fullName: string;
    email: string;
  };

  // Allow string indexing for table column access
  [key: string]: any;
}

export type LocationWithDistance = LocationDTO & { distance: number };
