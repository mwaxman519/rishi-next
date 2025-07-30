/**
 * Organizational Permission Utilities
 * Extends the existing RBAC system with organization-specific feature controls
 */

import {
  UserRole,
  getRolePermissions,
  permissionMatches,
} from &quot;@shared/rbac-roles&quot;;

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
  if (userRole === &quot;super_admin&quot;) {
    return true;
  }

  // Get base role permissions
  const rolePermissions = getRolePermissions(userRole);

  // For brand agents, apply organizational restrictions
  if (userRole === &quot;brand_agent&quot;) {
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
    case &quot;view:events&quot;:
    case &quot;view:events:organizational&quot;:
      // Brand agents can only view organizational events if explicitly enabled
      return organizationSettings[&quot;brand_agents_view_org_events&quot;] === true;

    case &quot;view:events:assigned&quot;:
    case &quot;view:schedule:own&quot;:
      // Brand agents can always view their own assigned events and schedule
      return true;

    case &quot;edit:availability:own&quot;:
      // Brand agents can manage their availability unless disabled
      return organizationSettings[&quot;brand_agents_manage_availability&quot;] !== false;

    case &quot;view:profile:own&quot;:
    case &quot;edit:profile:own&quot;:
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
    console.error(&quot;Error loading organization settings:&quot;, error);
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
    &quot;view:events:assigned&quot;,
    &quot;view:schedule:own&quot;,
    &quot;edit:availability:own&quot;,
    &quot;view:profile:own&quot;,
    &quot;edit:profile:own&quot;,
  ],

  // With organizational setting enabled, brand agents can see all events
  BRAND_AGENT_ENHANCED: [
    &quot;view:events:assigned&quot;,
    &quot;view:events:organizational&quot;,
    &quot;view:schedule:own&quot;,
    &quot;edit:availability:own&quot;,
    &quot;view:profile:own&quot;,
    &quot;edit:profile:own&quot;,
  ],

  // Field coordinators and above can see all events
  FIELD_COORDINATOR_AND_ABOVE: [
    &quot;view:events&quot;,
    &quot;view:events:organizational&quot;,
    &quot;view:events:assigned&quot;,
    &quot;view:staff&quot;,
    &quot;view:assignments&quot;,
    &quot;view:clients&quot;,
    &quot;edit:assignments&quot;,
    &quot;create:assignments&quot;,
  ],
};
