/**
 * Feature Module Registry
 * Manages feature availability and initialization for different organization tiers
 */

import { organizations } from "@shared/schema";

// Feature tier definitions
export type OrganizationTier = "tier_1" | "tier_2" | "tier_3";

// Available features by tier
export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  tier: OrganizationTier;
  enabled: boolean;
  dependencies?: string[];
}

// Feature registry containing all available features
export const FeatureModuleRegistry: Record<string, FeatureModule> = {
  // Tier 1 Features (Staff Leasing)
  staff_selection: {
    id: "staff_selection",
    name: "Staff Selection Tools",
    description: "Basic staff selection and assignment tools",
    tier: "tier_1",
    enabled: true,
  },
  basic_scheduling: {
    id: "basic_scheduling",
    name: "Basic Scheduling",
    description: "Simple scheduling and calendar management",
    tier: "tier_1",
    enabled: true,
  },
  location_management: {
    id: "location_management",
    name: "Location Management",
    description: "Manage dispensary and event locations",
    tier: "tier_1",
    enabled: true,
  },

  // Tier 2 Features (Event Staffing)
  advanced_reporting: {
    id: "advanced_reporting",
    name: "Advanced Reporting",
    description: "Detailed analytics and performance reports",
    tier: "tier_2",
    enabled: true,
    dependencies: ["basic_scheduling"],
  },
  event_management: {
    id: "event_management",
    name: "Event Management",
    description: "Comprehensive event planning and execution",
    tier: "tier_2",
    enabled: true,
  },
  inventory_tracking: {
    id: "inventory_tracking",
    name: "Inventory Tracking",
    description: "Track equipment and materials for events",
    tier: "tier_2",
    enabled: true,
  },

  // Tier 3 Features (White-label)
  white_labeling: {
    id: "white_labeling",
    name: "White Labeling",
    description: "Custom branding and white-label capabilities",
    tier: "tier_3",
    enabled: true,
    dependencies: ["advanced_reporting", "event_management"],
  },
  api_access: {
    id: "api_access",
    name: "API Access",
    description: "Full API access for custom integrations",
    tier: "tier_3",
    enabled: true,
  },
  custom_workflows: {
    id: "custom_workflows",
    name: "Custom Workflows",
    description: "Create custom business process workflows",
    tier: "tier_3",
    enabled: true,
  },
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  featureId: string,
  organizationTier?: string,
): boolean {
  const feature = FeatureModuleRegistry[featureId];
  if (!feature) {
    return false;
  }

  // If organization tier is provided, check tier access
  if (organizationTier) {
    return (
      isFeatureAvailableForTier(featureId, organizationTier) && feature.enabled
    );
  }

  return feature.enabled;
}

/**
 * Set feature status (enable/disable)
 */
export function setFeatureStatus(featureId: string, enabled: boolean): boolean {
  const feature = FeatureModuleRegistry[featureId];
  if (!feature) {
    return false;
  }

  feature.enabled = enabled;
  return true;
}

/**
 * Check if a feature is available for a specific organization tier
 */
export function isFeatureAvailableForTier(
  featureId: string,
  organizationTier: string,
): boolean {
  const feature = FeatureModuleRegistry[featureId];
  if (!feature) {
    return false;
  }

  // Define tier hierarchy
  const tierLevels: Record<string, number> = {
    tier_1: 1,
    tier_2: 2,
    tier_3: 3,
  };

  const requiredLevel = tierLevels[feature.tier];
  const organizationLevel = tierLevels[organizationTier];

  if (requiredLevel === undefined || organizationLevel === undefined) {
    return false;
  }

  return organizationLevel >= requiredLevel && feature.enabled;
}

/**
 * Get all available features for an organization tier
 */
export function getFeaturesForTier(
  organizationTier: OrganizationTier,
): FeatureModule[] {
  return Object.values(FeatureModuleRegistry).filter((feature) =>
    isFeatureAvailableForTier(feature.id, organizationTier),
  );
}

/**
 * Initialize organization features based on tier
 */
export function initializeOrganizationFeatures(
  organizationId: string,
  tier: OrganizationTier,
): {
  enabledFeatures: string[];
  totalFeatures: number;
} {
  const availableFeatures = getFeaturesForTier(tier);
  const enabledFeatures = availableFeatures
    .filter((feature) => feature.enabled)
    .map((feature) => feature.id);

  // In a real implementation, this would save to database
  console.log(
    `Initialized ${enabledFeatures.length} features for organization ${organizationId}`,
  );

  return {
    enabledFeatures,
    totalFeatures: availableFeatures.length,
  };
}

/**
 * Validate feature dependencies
 */
export function validateFeatureDependencies(
  featureId: string,
  enabledFeatures: string[],
): boolean {
  const feature = FeatureModuleRegistry[featureId];
  if (!feature || !feature.dependencies) {
    return true;
  }

  return feature.dependencies.every((dep) => enabledFeatures.includes(dep));
}

/**
 * Get feature module by ID
 */
export function getFeatureModule(featureId: string): FeatureModule | undefined {
  return FeatureModuleRegistry[featureId];
}

/**
 * Get all feature modules
 */
export function getAllModules(): FeatureModule[] {
  return Object.values(FeatureModuleRegistry);
}

/**
 * Export the registry object with getAllModules method for API compatibility
 */
export const FeatureModuleRegistryWithMethods = {
  ...FeatureModuleRegistry,
  getAllModules,
};
