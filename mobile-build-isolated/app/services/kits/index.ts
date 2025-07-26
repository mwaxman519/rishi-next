/**
 * Kit Management Service Public API
 */
import { KitRepository } from "./repository";
import { KitsService } from "./kitsService";

// Create repository and service instances
const kitRepository = new KitRepository();
export const kitsService = new KitsService(kitRepository);

// Export types and interfaces
export * from "./models";
export { KitsService } from "./kitsService";
