/**
 * Core feature module
 * This module provides core functionality available to all organizations
 */
import { FeatureModule } from "../types";
import { OrganizationTier } from "../../tiers";

/**
 * Core feature module definition
 * This feature is available to all organizations and cannot be disabled
 */
export const CoreFeature: FeatureModule = {
  id: "core",
  name: "Core Functionality",
  description:
    "Essential features required for basic system operation including user management, authentication, and basic scheduling.",
  icon: "server",
  availableTiers: [
    OrganizationTier.TIER1,
    OrganizationTier.TIER2,
    OrganizationTier.TIER3,
  ],
  userConfigurable: false, // Core features cannot be disabled

  // Initialize core feature for an organization
  initializeForOrganization: async (organizationId: string) => {
    console.log(`Initializing core feature for organization ${organizationId}`);
    // Core initialization logic
    // For example: setup initial system roles, create default templates, etc.
  },
};
