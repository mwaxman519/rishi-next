import { db } from "../../lib/db";
import { locations } from "@shared/schema";
import { EventBusService } from "./EventBusService";
import { ServiceRegistry } from "./ServiceRegistry";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

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
        type: "location.query.started",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllLocations",
          queryType: "list"
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
          type: location.type || "venue",
          address1: location.address1 || "",
          address2: location.address2 || "",
          city: location.city,
          state: location.state || "",
          stateCode: "",
          zipcode: location.zipcode || "",
          geoLat: location.geo_lat || "",
          geoLng: location.geo_lng || "",
          status: location.status || "active",
          active: location.active,
        }));

      // Publish success event
      await this.eventBus.publish({
        type: "location.query.completed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllLocations",
          resultCount: activeLocations.length,
          totalCount: allLocations.length
        }
      });

      return activeLocations;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: "location.query.failed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllLocations",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async getLocationById(locationId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "location.query.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getLocationById",
          targetId: locationId
        }
      });

      const [location] = await db
        .select()
        .from(locations)
        .where(eq(locations.id, locationId))
        .limit(1);

      await this.eventBus.publish({
        type: "location.query.completed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getLocationById",
          found: !!location
        }
      });

      return location;
    } catch (error) {
      await this.eventBus.publish({
        type: "location.query.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getLocationById",
          error: error instanceof Error ? error.message : "Unknown error"
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
        type: "location.create.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createLocation",
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
        type: "location.created",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createLocation",
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
        type: "location.create.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createLocation",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async updateLocation(locationId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "location.update.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateLocation",
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
        type: "location.updated",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateLocation",
          locationId,
          changes: Object.keys(data)
        }
      });

      return updatedLocation;
    } catch (error) {
      await this.eventBus.publish({
        type: "location.update.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateLocation",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }
}