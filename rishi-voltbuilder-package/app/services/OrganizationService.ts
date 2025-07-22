import { db } from "../../server/db";
import { organizations } from "@shared/schema";
import { EventBusService } from "./EventBusService";
import { ServiceRegistry } from "./ServiceRegistry";
import { v4 as uuidv4 } from "uuid";

export interface OrganizationServiceInterface {
  getAllOrganizations(userId: string, correlationId?: string): Promise<any[]>;
  getOrganizationById(organizationId: string, userId: string, correlationId?: string): Promise<any>;
  createOrganization(data: any, userId: string, correlationId?: string): Promise<any>;
  updateOrganization(organizationId: string, data: any, userId: string, correlationId?: string): Promise<any>;
}

export class OrganizationService implements OrganizationServiceInterface {
  private static instance: OrganizationService;
  private eventBus: EventBusService;
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.eventBus = new EventBusService();
    this.serviceRegistry = ServiceRegistry.getInstance();
  }

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  async getAllOrganizations(userId: string, correlationId?: string): Promise<any[]> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      // Publish event for organization query
      await this.eventBus.publish({
        type: "organization.query.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllOrganizations",
          queryType: "list"
        }
      });

      // Query database
      const allOrganizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          tier: organizations.tier,
        })
        .from(organizations)
        .orderBy(organizations.name);

      // Publish success event
      await this.eventBus.publish({
        type: "organization.query.completed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllOrganizations",
          resultCount: allOrganizations.length
        }
      });

      return allOrganizations;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: "organization.query.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getAllOrganizations",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async getOrganizationById(organizationId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "organization.query.started",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getOrganizationById",
          targetId: organizationId
        }
      });

      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      await this.eventBus.publish({
        type: "organization.query.completed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getOrganizationById",
          found: !!organization
        }
      });

      return organization;
    } catch (error) {
      await this.eventBus.publish({
        type: "organization.query.failed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "getOrganizationById",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async createOrganization(data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    const organizationId = uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "organization.create.started",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createOrganization",
          organizationName: data.name
        }
      });

      const [newOrganization] = await db
        .insert(organizations)
        .values({
          id: organizationId,
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      await this.eventBus.publish({
        type: "organization.created",
        userId,
        organizationId: newOrganization.id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createOrganization",
          organizationName: newOrganization.name,
          organizationType: newOrganization.type,
          organizationTier: newOrganization.tier
        }
      });

      return newOrganization;
    } catch (error) {
      await this.eventBus.publish({
        type: "organization.create.failed",
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "createOrganization",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }

  async updateOrganization(organizationId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: "organization.update.started",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateOrganization",
          updates: Object.keys(data)
        }
      });

      const [updatedOrganization] = await db
        .update(organizations)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(organizations.id, organizationId))
        .returning();

      await this.eventBus.publish({
        type: "organization.updated",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateOrganization",
          changes: Object.keys(data)
        }
      });

      return updatedOrganization;
    } catch (error) {
      await this.eventBus.publish({
        type: "organization.update.failed",
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: "updateOrganization",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
      
      throw error;
    }
  }
}

// Missing import fix
import { eq } from "drizzle-orm";