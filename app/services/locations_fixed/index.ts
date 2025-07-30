import { LocationRepository } from "./repository";
import { LocationsService } from "./locationsService";

export * from "./models";

const locationRepository = new LocationRepository();
export const locationsService = new LocationsService(locationRepository);
