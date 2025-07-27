/**
 * Organization tier definitions
 * This file defines the available organization tiers and their capabilities
 */

/**
 * Organization type enum
 * Defines the types of organizations in the system
 *
 * Internal: Rishi internal staff
 * Client: Client organizations using the platform
 * Partner: Partner organizations integrated with the platform
 */
export enum OrganizationType {
  INTERNAL = "internal",
  CLIENT = "client",
  PARTNER = "partner",
}

/**
 * Organization type constants
 * For use in code where the enum isn't appropriate
 */
export const ORGANIZATION_TYPES = {
  INTERNAL: "internal",
  CLIENT: "client",
  PARTNER: "partner",
} as const;

/**
 * Organization tier enum
 * Defines the available organization tiers
 *
 * Tier 1: Clients that lease Rishi staff (Brand Agents)
 * Tier 2: Clients that request full-service event staffing
 * Tier 3: White-label clients that manage their entire operation
 */
export enum OrganizationTier {
  TIER1 = "tier_1",
  TIER2 = "tier_2",
  TIER3 = "tier_3",
}

/**
 * Organization tier constants
 * For use in code where the enum isn't appropriate
 */
export const ORGANIZATION_TIERS = {
  TIER_1: "tier_1",
  TIER_2: "tier_2",
  TIER_3: "tier_3",
} as const;

/**
 * Tier display names
 * Human-readable names for organization tiers
 */
export const TIER_DISPLAY_NAMES = {
  [OrganizationTier.TIER1]: "Staff Leasing",
  [OrganizationTier.TIER2]: "Full-Service",
  [OrganizationTier.TIER3]: "White Label",
};

/**
 * Tier descriptions
 * Detailed descriptions of organization tiers
 */
export const TIER_DESCRIPTIONS = {
  [OrganizationTier.TIER1]:
    "Lease Brand Agents for your events. You manage your events and bookings.",
  [OrganizationTier.TIER2]:
    "Request full-service event staffing. We handle agent coordination.",
  [OrganizationTier.TIER3]:
    "White-label solution with complete customization and your own staff.",
};

/**
 * Tier capabilities
 * Feature categories available to each tier
 */
export const TIER_CAPABILITIES = {
  [OrganizationTier.TIER1]: [
    "User management",
    "Basic scheduling",
    "Agent selection",
    "Event booking",
    "Basic reporting",
  ],
  [OrganizationTier.TIER2]: [
    "User management",
    "Advanced scheduling",
    "Agent selection",
    "Event booking",
    "Advanced reporting",
    "Performance analytics",
    "Billing management",
  ],
  [OrganizationTier.TIER3]: [
    "User management",
    "Advanced scheduling",
    "Custom team structure",
    "Complete branding customization",
    "Advanced reporting",
    "Performance analytics",
    "Billing management",
    "API access",
    "Custom integrations",
  ],
};
