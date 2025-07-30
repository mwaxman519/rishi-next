// RBAC user roles
export const USER_ROLES = [
  &quot;super_admin&quot;,
  &quot;internal_admin&quot;,
  &quot;internal_field_manager&quot;,
  &quot;field_coordinator&quot;,
  &quot;brand_agent&quot;,
  &quot;client_manager&quot;,
  &quot;client_user&quot;,
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Organization types
export const ORGANIZATION_TYPES = [
  &quot;internal&quot;, // Rishi internal organization
  &quot;client&quot;, // Client organizations
  &quot;partner&quot;, // Partner organizations
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

// Client organization tiers
export const CLIENT_TIERS = [
  &quot;tier_1&quot;, // Clients lease Rishi staff (Brand Agents) for their events
  &quot;tier_2&quot;, // Clients request event bookings, Rishi manages agent coordination
  &quot;tier_3&quot;, // White-label clients manage their entire operation using the system
] as const;

export type ClientTier = (typeof CLIENT_TIERS)[number];
