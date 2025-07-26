// RBAC user roles
export const USER_ROLES = [
  "super_admin",
  "internal_admin",
  "internal_field_manager",
  "field_coordinator",
  "brand_agent",
  "client_manager",
  "client_user",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Organization types
export const ORGANIZATION_TYPES = [
  "internal", // Rishi internal organization
  "client", // Client organizations
  "partner", // Partner organizations
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

// Client organization tiers
export const CLIENT_TIERS = [
  "tier_1", // Clients lease Rishi staff (Brand Agents) for their events
  "tier_2", // Clients request event bookings, Rishi manages agent coordination
  "tier_3", // White-label clients manage their entire operation using the system
] as const;

export type ClientTier = (typeof CLIENT_TIERS)[number];
