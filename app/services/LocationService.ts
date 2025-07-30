import { db } from &quot;../../lib/db&quot;;
import { locations } from &quot;@shared/schema&quot;;
import { EventBusService } from &quot;./EventBusService&quot;;
import { ServiceRegistry } from &quot;./ServiceRegistry&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;
import { eq, and } from &quot;drizzle-orm&quot;;

export interface LocationServiceInterface {
  getAllLocations(userId: string, organizationId: string, correlationId?: string): Promise<any[]>;
  getLocationById(locationId: string, userId: string, correlationId?: string): Promise<any>;
  createLocation(data: any, userId: string, correlationId?: string): Promise<any>;
  updateLocation(locationId: string, data: any, userId: string, correlationId?: string): Promise<any>;
}

export class LocationService implements LocationServiceInterface {
  private static instance: LocationService;
  private eventBus: EventBusService;
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.eventBus = new EventBusService();
    this.serviceRegistry = ServiceRegistry.getInstance();
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getAllLocations(userId: string, organizationId: string, correlationId?: string): Promise<any[]> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      // Publish event for location query
      await this.eventBus.publish({
        type: &quot;location.query.started&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllLocations&quot;,
          queryType: &quot;list&quot;
        }
      });

      // Query database
      const allLocations = await db
        .select()
        .from(locations);

      // Filter active locations
      const activeLocations = allLocations
        .filter(location => location.active === true)
        .map(location => ({
          id: location.id,
          name: location.name,
          type: location.type || &quot;venue&quot;,
          address1: location.address1 || "&quot;,
          address2: location.address2 || &quot;&quot;,
          city: location.city,
          state: location.state || &quot;&quot;,
          stateCode: &quot;&quot;,
          zipcode: location.zipcode || &quot;&quot;,
          geoLat: location.geo_lat || &quot;&quot;,
          geoLng: location.geo_lng || &quot;&quot;,
          status: location.status || &quot;active&quot;,
          active: location.active,
        }));

      // Publish success event
      await this.eventBus.publish({
        type: &quot;location.query.completed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllLocations&quot;,
          resultCount: activeLocations.length,
          totalCount: allLocations.length
        }
      });

      return activeLocations;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: &quot;location.query.failed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllLocations&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async getLocationById(locationId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;location.query.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getLocationById&quot;,
          targetId: locationId
        }
      });

      const [location] = await db
        .select()
        .from(locations)
        .where(eq(locations.id, locationId))
        .limit(1);

      await this.eventBus.publish({
        type: &quot;location.query.completed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getLocationById&quot;,
          found: !!location
        }
      });

      return location;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;location.query.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getLocationById&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async createLocation(data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    const locationId = uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;location.create.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createLocation&quot;,
          locationName: data.name,
          locationType: data.type
        }
      });

      const [newLocation] = await db
        .insert(locations)
        .values({
          id: locationId,
          ...data,
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      await this.eventBus.publish({
        type: &quot;location.created&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createLocation&quot;,
          locationId: newLocation.id,
          locationName: newLocation.name,
          locationType: newLocation.type,
          city: newLocation.city,
          state: newLocation.state
        }
      });

      return newLocation;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;location.create.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createLocation&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async updateLocation(locationId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;location.update.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateLocation&quot;,
          locationId,
          updates: Object.keys(data)
        }
      });

      const [updatedLocation] = await db
        .update(locations)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(locations.id, locationId))
        .returning();

      await this.eventBus.publish({
        type: &quot;location.updated&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateLocation&quot;,
          locationId,
          changes: Object.keys(data)
        }
      });

      return updatedLocation;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;location.update.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateLocation&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error"
        }
      });
      
      throw error;
    }
  }
}