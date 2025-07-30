import { LocationRepository } from &quot;./repository&quot;;
import { LocationsService } from &quot;./locationsService&quot;;

export * from &quot;./models&quot;;

const locationRepository = new LocationRepository();
export const locationsService = new LocationsService(locationRepository);
