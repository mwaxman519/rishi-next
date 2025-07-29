/**
 * Type definitions for Kit-related data structures
 * Used by both the API and UI components
 */

// Basic Kit data structure
export interface KitDTO {
  id: string;
  name: string;
  description?: string;
  status: string;
  active: boolean;
  organization_id?: string;
  location_id?: string;
  template_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  template?: {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

// Kit Template data structure
export interface KitTemplateDTO {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  organization_id?: string;
  components?: any; // JSON structure for template components
  instructions?: string;
  approval_status?: string;
  approved_by_id?: string;
  approval_date?: string | Date;
  approval_notes?: string;
  requested_by_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Activity Kit data structure (for assigning kits to activities)
export interface ActivityKitDTO {
  id: string;
  activity_id: string;
  kit_template_id?: string;
  kit_instance_id?: string;
  quantity: number;
  notes?: string;
  status: string;
  assigned_to_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  kitTemplate?: {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
  };
  kitInstance?: {
    id: string;
    name: string;
    description?: string;
    status: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

// Kit creation request payload
export interface CreateKitParams {
  name: string;
  description?: string;
  template_id?: string;
  organization_id?: string;
  location_id?: string;
  status?: string;
}

// Kit update request payload
export interface UpdateKitParams {
  name?: string;
  description?: string;
  template_id?: string;
  organization_id?: string;
  location_id?: string;
  status?: string;
  active?: boolean;
}

// Activity Kit creation request payload
export interface CreateActivityKitParams {
  activity_id: string;
  kit_template_id?: string;
  kit_instance_id?: string;
  quantity: number;
  notes?: string;
  status?: string;
  assigned_to_id?: string;
}
