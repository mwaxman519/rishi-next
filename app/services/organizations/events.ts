/**
 * Organization Management Events
 * Event definitions for microservice communication
 */

import { EventBus } from &quot;../core/EventBus&quot;;

// Event Bus Instance
export const organizationEventBus = new EventBus();

// Event Types
export const ORGANIZATION_EVENTS = {
  CREATED: &quot;organization.created&quot;,
  UPDATED: &quot;organization.updated&quot;,
  ACTIVATED: &quot;organization.activated&quot;,
  DEACTIVATED: &quot;organization.deactivated&quot;,
  DELETED: &quot;organization.deleted&quot;,
  MEMBER_ADDED: &quot;organization.member.added&quot;,
  MEMBER_REMOVED: &quot;organization.member.removed&quot;,
  MEMBER_ROLE_UPDATED: &quot;organization.member.role.updated&quot;,
} as const;

// Event Interfaces
export interface OrganizationCreatedEvent {
  type: typeof ORGANIZATION_EVENTS.CREATED;
  payload: {
    organization: any;
    createdBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationUpdatedEvent {
  type: typeof ORGANIZATION_EVENTS.UPDATED;
  payload: {
    organization: any;
    updatedBy: string;
    changes: Record<string, any>;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationActivatedEvent {
  type: typeof ORGANIZATION_EVENTS.ACTIVATED;
  payload: {
    organization: any;
    activatedBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationDeactivatedEvent {
  type: typeof ORGANIZATION_EVENTS.DEACTIVATED;
  payload: {
    organization: any;
    deactivatedBy: string;
    reason?: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationDeletedEvent {
  type: typeof ORGANIZATION_EVENTS.DELETED;
  payload: {
    organizationId: string;
    deletedBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationMemberAddedEvent {
  type: typeof ORGANIZATION_EVENTS.MEMBER_ADDED;
  payload: {
    organizationId: string;
    userId: string;
    role: string;
    addedBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationMemberRemovedEvent {
  type: typeof ORGANIZATION_EVENTS.MEMBER_REMOVED;
  payload: {
    organizationId: string;
    userId: string;
    removedBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

export interface OrganizationMemberRoleUpdatedEvent {
  type: typeof ORGANIZATION_EVENTS.MEMBER_ROLE_UPDATED;
  payload: {
    organizationId: string;
    userId: string;
    oldRole: string;
    newRole: string;
    updatedBy: string;
    timestamp: Date;
  };
  metadata: {
    eventId: string;
    version: string;
    source: string;
  };
}

// Event Publisher
export class OrganizationEventPublisher {
  constructor(private eventBus: EventBus = organizationEventBus) {}

  async publishOrganizationCreated(
    organization: any,
    createdBy: string,
  ): Promise<void> {
    const event: OrganizationCreatedEvent = {
      type: ORGANIZATION_EVENTS.CREATED,
      payload: {
        organization,
        createdBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.CREATED, event);
  }

  async publishOrganizationUpdated(
    organization: any,
    updatedBy: string,
    changes: Record<string, any>,
  ): Promise<void> {
    const event: OrganizationUpdatedEvent = {
      type: ORGANIZATION_EVENTS.UPDATED,
      payload: {
        organization,
        updatedBy,
        changes,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.UPDATED, event);
  }

  async publishOrganizationActivated(
    organization: any,
    activatedBy: string,
  ): Promise<void> {
    const event: OrganizationActivatedEvent = {
      type: ORGANIZATION_EVENTS.ACTIVATED,
      payload: {
        organization,
        activatedBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.ACTIVATED, event);
  }

  async publishOrganizationDeactivated(
    organization: any,
    deactivatedBy: string,
    reason?: string,
  ): Promise<void> {
    const event: OrganizationDeactivatedEvent = {
      type: ORGANIZATION_EVENTS.DEACTIVATED,
      payload: {
        organization,
        deactivatedBy,
        reason,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.DEACTIVATED, event);
  }

  async publishOrganizationDeleted(
    organizationId: string,
    deletedBy: string,
  ): Promise<void> {
    const event: OrganizationDeletedEvent = {
      type: ORGANIZATION_EVENTS.DELETED,
      payload: {
        organizationId,
        deletedBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.DELETED, event);
  }

  async publishMemberAdded(
    organizationId: string,
    userId: string,
    role: string,
    addedBy: string,
  ): Promise<void> {
    const event: OrganizationMemberAddedEvent = {
      type: ORGANIZATION_EVENTS.MEMBER_ADDED,
      payload: {
        organizationId,
        userId,
        role,
        addedBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.MEMBER_ADDED, event);
  }

  async publishMemberRemoved(
    organizationId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    const event: OrganizationMemberRemovedEvent = {
      type: ORGANIZATION_EVENTS.MEMBER_REMOVED,
      payload: {
        organizationId,
        userId,
        removedBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.MEMBER_REMOVED, event);
  }

  async publishMemberRoleUpdated(
    organizationId: string,
    userId: string,
    oldRole: string,
    newRole: string,
    updatedBy: string,
  ): Promise<void> {
    const event: OrganizationMemberRoleUpdatedEvent = {
      type: ORGANIZATION_EVENTS.MEMBER_ROLE_UPDATED,
      payload: {
        organizationId,
        userId,
        oldRole,
        newRole,
        updatedBy,
        timestamp: new Date(),
      },
      metadata: {
        eventId: crypto.randomUUID(),
        version: &quot;1.0&quot;,
        source: &quot;organization-service&quot;,
      },
    };

    await this.eventBus.publish(ORGANIZATION_EVENTS.MEMBER_ROLE_UPDATED, event);
  }
}

// Event Handler
export class OrganizationEventHandler {
  constructor(private eventBus: EventBus = organizationEventBus) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.CREATED,
      this.handleOrganizationCreated.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.UPDATED,
      this.handleOrganizationUpdated.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.ACTIVATED,
      this.handleOrganizationActivated.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.DEACTIVATED,
      this.handleOrganizationDeactivated.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.DELETED,
      this.handleOrganizationDeleted.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.MEMBER_ADDED,
      this.handleMemberAdded.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.MEMBER_REMOVED,
      this.handleMemberRemoved.bind(this),
    );
    this.eventBus.subscribe(
      ORGANIZATION_EVENTS.MEMBER_ROLE_UPDATED,
      this.handleMemberRoleUpdated.bind(this),
    );
  }

  private async handleOrganizationCreated(
    event: OrganizationCreatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling organization created: ${event.payload.organization.id}`,
    );

    // Initialize organization defaults
    await this.initializeOrganizationDefaults(event);

    // Update analytics
    await this.updateOrganizationAnalytics(event);
  }

  private async handleOrganizationUpdated(
    event: OrganizationUpdatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling organization updated: ${event.payload.organization.id}`,
    );

    // Record audit trail
    await this.recordAuditTrail(event);

    // Update analytics
    await this.updateOrganizationAnalytics(event);
  }

  private async handleOrganizationActivated(
    event: OrganizationActivatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling organization activated: ${event.payload.organization.id}`,
    );

    // Send activation notifications
    await this.sendActivationNotifications(event);

    // Update analytics
    await this.updateOrganizationAnalytics(event);
  }

  private async handleOrganizationDeactivated(
    event: OrganizationDeactivatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling organization deactivated: ${event.payload.organization.id}`,
    );

    // Send deactivation notifications
    await this.sendDeactivationNotifications(event);

    // Update analytics
    await this.updateOrganizationAnalytics(event);
  }

  private async handleOrganizationDeleted(
    event: OrganizationDeletedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling organization deleted: ${event.payload.organizationId}`,
    );

    // Clean up related data
    await this.cleanupRelatedData(event);

    // Record audit trail
    await this.recordAuditTrail(event);
  }

  private async handleMemberAdded(
    event: OrganizationMemberAddedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling member added: ${event.payload.userId} to ${event.payload.organizationId}`,
    );

    // Send welcome notifications
    await this.sendWelcomeNotifications(event);

    // Update analytics
    await this.updateMembershipAnalytics(event);
  }

  private async handleMemberRemoved(
    event: OrganizationMemberRemovedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling member removed: ${event.payload.userId} from ${event.payload.organizationId}`,
    );

    // Clean up member data
    await this.cleanupMemberData(event);

    // Update analytics
    await this.updateMembershipAnalytics(event);
  }

  private async handleMemberRoleUpdated(
    event: OrganizationMemberRoleUpdatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Handling member role updated: ${event.payload.userId} in ${event.payload.organizationId}`,
    );

    // Send role change notifications
    await this.sendRoleChangeNotifications(event);

    // Update analytics
    await this.updateMembershipAnalytics(event);
  }

  // Service Integration Methods
  private async initializeOrganizationDefaults(
    event: OrganizationCreatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Initializing defaults for organization: ${event.payload.organization.id}`,
    );
  }

  private async sendActivationNotifications(
    event: OrganizationActivatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Sending activation notifications for organization: ${event.payload.organization.id}`,
    );
  }

  private async sendDeactivationNotifications(
    event: OrganizationDeactivatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Sending deactivation notifications for organization: ${event.payload.organization.id}`,
    );
  }

  private async sendWelcomeNotifications(
    event: OrganizationMemberAddedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Sending welcome notifications for user: ${event.payload.userId}`,
    );
  }

  private async sendRoleChangeNotifications(
    event: OrganizationMemberRoleUpdatedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Sending role change notifications for user: ${event.payload.userId}`,
    );
  }

  private async updateOrganizationAnalytics(event: any): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Updating organization analytics for event: ${event.type}`,
    );
  }

  private async updateMembershipAnalytics(event: any): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Updating membership analytics for event: ${event.type}`,
    );
  }

  private async recordAuditTrail(event: any): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Recording audit trail for event: ${event.type}`,
    );
  }

  private async cleanupRelatedData(
    event: OrganizationDeletedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Cleaning up data for deleted organization: ${event.payload.organizationId}`,
    );
  }

  private async cleanupMemberData(
    event: OrganizationMemberRemovedEvent,
  ): Promise<void> {
    console.log(
      `[OrganizationEventHandler] Cleaning up member data for user: ${event.payload.userId}`,
    );
  }
}

// Initialize event handlers
export const organizationEventHandler = new OrganizationEventHandler();
export const organizationEventPublisher = new OrganizationEventPublisher();
