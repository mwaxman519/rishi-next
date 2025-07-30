import { db } from &quot;../lib/db-connection&quot;;
import { organizations } from &quot;@shared/schema&quot;;
import { EventBusService } from &quot;./EventBusService&quot;;
import { ServiceRegistry } from &quot;./ServiceRegistry&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;

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
        type: &quot;organization.query.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllOrganizations&quot;,
          queryType: &quot;list&quot;
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
        type: &quot;organization.query.completed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllOrganizations&quot;,
          resultCount: allOrganizations.length
        }
      });

      return allOrganizations;
    } catch (error) {
      // Publish error event
      await this.eventBus.publish({
        type: &quot;organization.query.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getAllOrganizations&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async getOrganizationById(organizationId: string, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;organization.query.started&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getOrganizationById&quot;,
          targetId: organizationId
        }
      });

      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      await this.eventBus.publish({
        type: &quot;organization.query.completed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getOrganizationById&quot;,
          found: !!organization
        }
      });

      return organization;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;organization.query.failed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;getOrganizationById&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
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
        type: &quot;organization.create.started&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createOrganization&quot;,
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
        type: &quot;organization.created&quot;,
        userId,
        organizationId: newOrganization.id,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createOrganization&quot;,
          organizationName: newOrganization.name,
          organizationType: newOrganization.type,
          organizationTier: newOrganization.tier
        }
      });

      return newOrganization;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;organization.create.failed&quot;,
        userId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;createOrganization&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }

  async updateOrganization(organizationId: string, data: any, userId: string, correlationId?: string): Promise<any> {
    const eventCorrelationId = correlationId || uuidv4();
    
    try {
      await this.eventBus.publish({
        type: &quot;organization.update.started&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateOrganization&quot;,
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
        type: &quot;organization.updated&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateOrganization&quot;,
          changes: Object.keys(data)
        }
      });

      return updatedOrganization;
    } catch (error) {
      await this.eventBus.publish({
        type: &quot;organization.update.failed&quot;,
        userId,
        organizationId,
        timestamp: new Date(),
        correlationId: eventCorrelationId,
        metadata: {
          action: &quot;updateOrganization&quot;,
          error: error instanceof Error ? error.message : &quot;Unknown error&quot;
        }
      });
      
      throw error;
    }
  }
}

// Missing import fix
import { eq } from &quot;drizzle-orm&quot;;