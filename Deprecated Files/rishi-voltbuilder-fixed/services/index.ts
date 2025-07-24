// Service registry for microservices architecture
export const services = {
  cannabisBooking: {
    async createCannabisBooking(data: any, userId: string) {
      // Mock implementation for development
      return {
        id: require("uuid").v4(),
        ...data,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
};

// Export EventBusService for API routes compatibility
export { EventBusService, eventBusService } from "./event-bus-service";

// Export FeatureRegistry for admin routes compatibility
export {
  FeatureModuleRegistry as FeatureRegistry,
  FeatureModuleRegistryWithMethods,
  getAllModules,
  isFeatureAvailableForTier,
  getFeaturesForTier,
} from "../shared/features/registry";
