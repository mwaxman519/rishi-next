/**
 * Location Service Models
 *
 * Defines the core data structures for the enhanced locations service
 */

// Location status enum
export enum LocationStatus {
  PENDING = &quot;pending&quot;,
  APPROVED = &quot;approved&quot;,
  REJECTED = &quot;rejected&quot;,
}

// Location type enum
export enum LocationType {
  OFFICE = &quot;office&quot;,
  STORE = &quot;store&quot;,
  WAREHOUSE = &quot;warehouse&quot;,
  FACILITY = &quot;facility&quot;,
  PARTNER = &quot;partner&quot;,
  OTHER = &quot;other&quot;,
}

// Represents a Location entity
export interface LocationDTO {
  id: string;
  name: string;
  type: LocationType;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  zipcode: string;
  phone?: string;
  email?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;

  // Geographic coordinates
  latitude?: number;
  longitude?: number;

  // Additional data
  status: LocationStatus;
  rejectionReason?: string;

  // Audit fields
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  approvedById?: string;
  rejectedById?: string;
  createdById?: string;
  updatedById?: string;

  // Organization association
  organizationId: string;

  // Additional geocoding metadata
  placeId?: string;
  formattedAddress?: string;
  geocodingAccuracy?: string;
}

// Parameters for creating a new location
export interface CreateLocationParams {
  name: string;
  type: LocationType;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  zipcode: string;
  phone?: string;
  email?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;

  // Enhanced params for geocoding
  validateAddress?: boolean;
  useFormattedAddress?: boolean;

  // Geographic coordinates (optional, will be set by geocoding if not provided)
  latitude?: number;
  longitude?: number;

  // Status (defaults to PENDING)
  status?: LocationStatus;
}

// Parameters for updating a location
export interface UpdateLocationParams {
  name?: string;
  type?: LocationType;
  address1?: string;
  address2?: string;
  city?: string;
  stateId?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;

  // Enhanced params for geocoding
  validateAddress?: boolean;
  useFormattedAddress?: boolean;

  // Geographic coordinates
  latitude?: number;
  longitude?: number;

  // Status update
  status?: LocationStatus;
  rejectionReason?: string;
}

// Parameters for approving a location
export interface ApproveLocationParams {
  id: string;
  requesterId?: string; // ID of the user who performed the approval
  notes?: string;
}

// Parameters for rejecting a location
export interface RejectLocationParams {
  id: string;
  reason?: string;
  requesterId?: string; // ID of the user who performed the rejection
  notes?: string;
}

// Geocoding metadata for a location
export interface GeocodingMetadata {
  placeId: string | null;
  formattedAddress: string | null;
  geocodingAccuracy: string;
}

// Parameters for searching locations
export interface LocationSearchParams {
  text?: string; // Free text search
  city?: string; // Filter by city
  stateId?: string; // Filter by state
  zipcode?: string; // Filter by zipcode
  type?: LocationType; // Filter by type
  status?: LocationStatus; // Filter by status
  radius?: number; // Search radius in miles (requires lat/lng)
  latitude?: number; // Center point for radius search
  longitude?: number; // Center point for radius search
  organizationId?: string; // Filter by organization
  limit?: number; // Limit results
  offset?: number; // Offset for pagination
  sortBy?: string; // Sort field
  sortOrder?: &quot;asc&quot; | &quot;desc&quot;; // Sort direction
}

// Location search result
export interface LocationSearchResult {
  locations: LocationDTO[];
  total: number;
  limit: number;
  offset: number;
}
