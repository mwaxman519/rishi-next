/**
 * Feature module type definitions
 * This file contains type definitions for the feature module system
 */
import { OrganizationTier } from "../tiers";

/**
 * Base feature module class
 * Acts as a foundation for all feature modules
 */
export abstract class BaseFeatureModule {
  abstract id: string;
  abstract name: string;
  description: string = "";
  icon: string = "Box";
  version: string = "1.0.0";

  // Which organization tiers can access this feature
  get availableTiers(): OrganizationTier[] {
    return Object.values(OrganizationTier);
  }

  userConfigurable: boolean = true;

  // Initialize the feature for an organization
  async initializeForOrganization(organizationId: string): Promise<void> {
    console.log(
      `Initializing feature ${this.id} for organization ${organizationId}`,
    );
  }

  // Check if the feature is enabled for a specific tier
  isEnabledForTier(tier: OrganizationTier): boolean {
    return this.availableTiers.includes(tier);
  }

  // Initialize feature module
  async initialize(): Promise<void> {
    console.log(`Initializing feature module: ${this.name}`);
  }

  // Shutdown feature module
  async shutdown(): Promise<void> {
    console.log(`Shutting down feature module: ${this.name}`);
  }
}

/**
 * Feature status type
 * Represents the status of a feature for an organization
 */
export type FeatureStatus = {
  id: string;
  featureId: string;
  organizationId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Feature configuration type
 * Represents configurable options for a feature
 * Each feature can define its own configuration schema
 */
export type FeatureConfiguration = Record<string, any>;

/**
 * Feature module interface
 * Defines the structure of a feature module
 */
export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  availableTiers: OrganizationTier[]; // Which organization tiers can access this feature
  userConfigurable: boolean; // Whether users can enable/disable this feature

  // Initialize the feature for an organization
  initializeForOrganization: (organizationId: string) => Promise<void>;

  // Optional: Run when feature is enabled (if not provided, no action is taken)
  onEnable?: (organizationId: string) => Promise<void>;

  // Optional: Run when feature is disabled (if not provided, no action is taken)
  onDisable?: (organizationId: string) => Promise<void>;

  // Optional: Default configuration for the feature
  defaultConfiguration?: FeatureConfiguration;
}

/**
 * Feature registry interface
 * Defines methods for working with feature modules
 */
export interface IFeatureRegistry {
  registerModule(module: FeatureModule): void;
  getModule(featureId: string): FeatureModule | undefined;
  getAllModules(): FeatureModule[];
  isFeatureAvailableForTier(featureId: string, tier: string | null): boolean;
  isFeatureEnabled(featureId: string, organizationId: string): Promise<boolean>;
  enableFeature(featureId: string, organizationId: string): Promise<void>;
  disableFeature(featureId: string, organizationId: string): Promise<void>;
  getFeatureStatus(
    featureId: string,
    organizationId: string,
  ): Promise<FeatureStatus | null>;
  getOrganizationFeatures(organizationId: string): Promise<FeatureStatus[]>;
}

/**
 * Feature module registry class
 * Implements the IFeatureRegistry interface
 */
export class FeatureModuleRegistry implements IFeatureRegistry {
  private modules: Map<string, FeatureModule> = new Map();

  constructor() {
    console.log("Feature module registry initialized");
  }

  registerModule(module: FeatureModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`Feature module with ID ${module.id} already registered`);
      return;
    }

    this.modules.set(module.id, module);
    console.log(`Registered feature module: ${module.name} (${module.id})`);
  }

  getModule(featureId: string): FeatureModule | undefined {
    return this.modules.get(featureId);
  }

  getAllModules(): FeatureModule[] {
    return Array.from(this.modules.values());
  }

  isFeatureAvailableForTier(featureId: string, tier: string | null): boolean {
    const module = this.getModule(featureId);
    if (!module || !tier) return false;

    // Convert string tier to OrganizationTier enum
    const orgTier = tier as OrganizationTier;
    return module.availableTiers.includes(orgTier);
  }

  async isFeatureEnabled(
    featureId: string,
    organizationId: string,
  ): Promise<boolean> {
    // In a real implementation, this would check the database
    // For simplicity, we'll always return true in development
    return true;
  }

  async enableFeature(
    featureId: string,
    organizationId: string,
  ): Promise<void> {
    const module = this.getModule(featureId);
    if (!module) {
      throw new Error(`Feature module with ID ${featureId} not found`);
    }

    // Call the module's onEnable handler if it exists
    if (module.onEnable) {
      await module.onEnable(organizationId);
    }

    console.log(
      `Enabled feature ${featureId} for organization ${organizationId}`,
    );
  }

  async disableFeature(
    featureId: string,
    organizationId: string,
  ): Promise<void> {
    const module = this.getModule(featureId);
    if (!module) {
      throw new Error(`Feature module with ID ${featureId} not found`);
    }

    // Call the module's onDisable handler if it exists
    if (module.onDisable) {
      await module.onDisable(organizationId);
    }

    console.log(
      `Disabled feature ${featureId} for organization ${organizationId}`,
    );
  }

  async getFeatureStatus(
    featureId: string,
    organizationId: string,
  ): Promise<FeatureStatus | null> {
    // In a real implementation, this would fetch from the database
    // For simplicity, we'll create a mock status
    return {
      id: `${featureId}_${organizationId}`,
      featureId,
      organizationId,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getOrganizationFeatures(
    organizationId: string,
  ): Promise<FeatureStatus[]> {
    // In a real implementation, this would fetch from the database
    // For simplicity, we'll create mock statuses for all modules
    return this.getAllModules().map((module) => ({
      id: `${module.id}_${organizationId}`,
      featureId: module.id,
      organizationId,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}
