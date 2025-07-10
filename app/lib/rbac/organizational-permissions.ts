/**
 * Organizational Permission Utilities
 * Extends the existing RBAC system with organization-specific feature controls
 */

import {
  UserRole,
  getRolePermissions,
  permissionMatches,
} from "@/shared/rbac-roles";

export interface OrganizationPermissionCheck {
  userRole: UserRole;
  permission: string;
  organizationId?: string;
  organizationSettings?: Record<string, boolean>;
}

/**
 * Check if a user has a specific permission within an organizational context
 */
export async function hasOrganizationalPermission({
  userRole,
  permission,
  organizationId,
  organizationSettings = {},
}: OrganizationPermissionCheck): Promise<boolean> {
  // Super admins always have all permissions
  if (userRole === "super_admin") {
    return true;
  }

  // Get base role permissions
  const rolePermissions = getRolePermissions(userRole);

  // For brand agents, apply organizational restrictions
  if (userRole === "brand_agent") {
    return checkBrandAgentPermissions(
      permission,
      organizationSettings,
      rolePermissions,
    );
  }

  // For other roles, check normal permissions
  return permissionMatches(permission, rolePermissions);
}

/**
 * Brand agent specific permission checking with organizational settings
 */
function checkBrandAgentPermissions(
  permission: string,
  organizationSettings: Record<string, boolean>,
  rolePermissions: string[],
): boolean {
  switch (permission) {
    case "view:events":
    case "view:events:organizational":
      // Brand agents can only view organizational events if explicitly enabled
      return organizationSettings["brand_agents_view_org_events"] === true;

    case "view:events:assigned":
    case "view:schedule:own":
      // Brand agents can always view their own assigned events and schedule
      return true;

    case "edit:availability:own":
      // Brand agents can manage their availability unless disabled
      return organizationSettings["brand_agents_manage_availability"] !== false;

    case "view:profile:own":
    case "edit:profile:own":
      // Brand agents can always manage their own profile
      return true;

    default:
      // For any other permissions, use the standard role-based check
      return permissionMatches(permission, rolePermissions);
  }
}

/**
 * Load organization settings from the API
 */
export async function loadOrganizationSettings(
  organizationId: string,
): Promise<Record<string, boolean>> {
  try {
    const response = await fetch(
      `/api/organizations/${organizationId}/feature-settings`,
    );
    if (response.ok) {
      return await response.json();
    }
    return getDefaultOrganizationSettings();
  } catch (error) {
    console.error("Error loading organization settings:", error);
    return getDefaultOrganizationSettings();
  }
}

/**
 * Get default organization settings
 */
export function getDefaultOrganizationSettings(): Record<string, boolean> {
  return {
    brand_agents_view_org_events: false, // Restrict by default
    brand_agents_manage_availability: true,
    field_coordinators_approve_assignments: true,
    client_users_create_events: true,
    enable_event_notifications: true,
  };
}

/**
 * Permission mappings for different event access levels
 */
export const EVENT_PERMISSIONS = {
  // Brand agents can only see their assigned events by default
  BRAND_AGENT_DEFAULT: [
    "view:events:assigned",
    "view:schedule:own",
    "edit:availability:own",
    "view:profile:own",
    "edit:profile:own",
  ],

  // With organizational setting enabled, brand agents can see all events
  BRAND_AGENT_ENHANCED: [
    "view:events:assigned",
    "view:events:organizational",
    "view:schedule:own",
    "edit:availability:own",
    "view:profile:own",
    "edit:profile:own",
  ],

  // Field coordinators and above can see all events
  FIELD_COORDINATOR_AND_ABOVE: [
    "view:events",
    "view:events:organizational",
    "view:events:assigned",
    "view:staff",
    "view:assignments",
    "view:clients",
    "edit:assignments",
    "create:assignments",
  ],
};
