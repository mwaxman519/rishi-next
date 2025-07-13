/**
 * Comprehensive EventBus Service for Rishi Platform
 * Handles all application events across the entire system
 */

import { AppEvent, EventPayload, EventMetadata } from '@/shared/events';

export interface EventHandler<T = any> {
  (payload: T, metadata?: EventMetadata): void | Promise<void>;
}

interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  id: string;
}

export class EventBusService {
  private static instance: EventBusService;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: Array<{ eventType: string; payload: any; metadata: EventMetadata; timestamp: Date }> = [];
  private isInitialized = false;

  private constructor() {
    this.initializeEventBus();
  }

  public static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  private initializeEventBus(): void {
    if (this.isInitialized) return;
    
    console.log('EventBusService initialized - handlers ready for registration');
    
    // Register comprehensive event handlers for all app functionality
    this.registerAllEventHandlers();
    
    this.isInitialized = true;
  }

  private registerAllEventHandlers(): void {
    // User Management Events
    this.subscribe(AppEvent.USER_CREATED, this.handleUserCreated);
    this.subscribe(AppEvent.USER_UPDATED, this.handleUserUpdated);
    this.subscribe(AppEvent.USER_DELETED, this.handleUserDeleted);
    this.subscribe(AppEvent.USER_PERMISSION_CHANGED, this.handleUserPermissionChanged);
    
    // Organization Events
    this.subscribe(AppEvent.ORGANIZATION_CREATED, this.handleOrganizationCreated);
    this.subscribe(AppEvent.ORGANIZATION_UPDATED, this.handleOrganizationUpdated);
    this.subscribe(AppEvent.ORGANIZATION_DELETED, this.handleOrganizationDeleted);
    
    // Location Events
    this.subscribe(AppEvent.LOCATION_CREATED, this.handleLocationCreated);
    this.subscribe(AppEvent.LOCATION_UPDATED, this.handleLocationUpdated);
    this.subscribe(AppEvent.LOCATION_DELETED, this.handleLocationDeleted);
    this.subscribe(AppEvent.LOCATION_APPROVED, this.handleLocationApproved);
    this.subscribe(AppEvent.LOCATION_REJECTED, this.handleLocationRejected);
    
    // System Events
    this.subscribe(AppEvent.SYSTEM_STARTED, this.handleSystemStarted);
    this.subscribe(AppEvent.SYSTEM_ERROR, this.handleSystemError);
    
    // Infrastructure Events
    this.subscribe(AppEvent.CIRCUIT_BREAKER_OPENED, this.handleCircuitBreakerStateChanged);
    this.subscribe(AppEvent.CIRCUIT_BREAKER_CLOSED, this.handleCircuitBreakerStateChanged);
    this.subscribe(AppEvent.CIRCUIT_BREAKER_HALF_OPEN, this.handleCircuitBreakerStateChanged);
    
    // Expense Events (existing)
    this.subscribe('expense.submitted', this.handleExpenseSubmitted);
    this.subscribe('expense.approved', this.handleExpenseApproved);
    this.subscribe('expense.rejected', this.handleExpenseRejected);
    this.subscribe('expense.updated', this.handleExpenseUpdated);
    this.subscribe('expense.deleted', this.handleExpenseDeleted);
    this.subscribe('expense.payment.processed', this.handleExpensePaymentProcessed);
    
    // Booking Events
    this.subscribe('booking.created', this.handleBookingCreated);
    this.subscribe('booking.updated', this.handleBookingUpdated);
    this.subscribe('booking.approved', this.handleBookingApproved);
    this.subscribe('booking.rejected', this.handleBookingRejected);
    this.subscribe('booking.cancelled', this.handleBookingCancelled);
    
    // Activity Events
    this.subscribe('activity.created', this.handleActivityCreated);
    this.subscribe('activity.updated', this.handleActivityUpdated);
    this.subscribe('activity.completed', this.handleActivityCompleted);
    
    // Kit Events
    this.subscribe('kit.created', this.handleKitCreated);
    this.subscribe('kit.updated', this.handleKitUpdated);
    this.subscribe('kit.approved', this.handleKitApproved);
    this.subscribe('kit.rejected', this.handleKitRejected);
    
    // Authentication Events
    this.subscribe('auth.login', this.handleAuthLogin);
    this.subscribe('auth.logout', this.handleAuthLogout);
    this.subscribe('auth.session.expired', this.handleAuthSessionExpired);
    
    // Analytics Events
    this.subscribe('analytics.event', this.handleAnalyticsEvent);
    this.subscribe('analytics.pageview', this.handleAnalyticsPageview);
    
    console.log(`[EventBus] Registered ${this.subscriptions.size} event types with comprehensive handlers`);
  }

  public subscribe<T extends keyof EventPayload>(
    eventType: T,
    handler: EventHandler<EventPayload[T]>
  ): () => void;
  public subscribe(
    eventType: string,
    handler: EventHandler
  ): () => void;
  public subscribe(
    eventType: string,
    handler: EventHandler
  ): () => void {
    const subscription: EventSubscription = {
      eventType,
      handler,
      id: this.generateSubscriptionId()
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);
    console.log(`[EventBus] Subscribed to event: ${eventType}`);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(eventType);
      if (handlers) {
        const index = handlers.findIndex(sub => sub.id === subscription.id);
        if (index !== -1) {
          handlers.splice(index, 1);
          console.log(`[EventBus] Unsubscribed from event: ${eventType}`);
        }
      }
    };
  }

  public async publish<T extends keyof EventPayload>(
    eventType: T,
    payload: EventPayload[T],
    metadata?: Partial<EventMetadata>
  ): Promise<void>;
  public async publish(
    eventType: string,
    payload: any,
    metadata?: Partial<EventMetadata>
  ): Promise<void>;
  public async publish(
    eventType: string,
    payload: any,
    metadata?: Partial<EventMetadata>
  ): Promise<void> {
    const eventMetadata: EventMetadata = {
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      priority: 'normal',
      ...metadata
    };

    // Store in history
    this.eventHistory.push({
      eventType,
      payload,
      metadata: eventMetadata,
      timestamp: new Date()
    });

    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    // Get handlers for this event type
    const handlers = this.subscriptions.get(eventType) || [];

    console.log(`[EventBus] Publishing event: ${eventType} to ${handlers.length} handlers`);

    // Execute all handlers
    const promises = handlers.map(subscription => {
      try {
        return Promise.resolve(subscription.handler(payload, eventMetadata));
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  // Event Handlers - Comprehensive coverage for all app functionality
  private handleUserCreated = (payload: any): void => {
    console.log(`[EventBus] User created: ${payload.username}`);
    // Add user creation analytics, notifications, etc.
  };

  private handleUserUpdated = (payload: any): void => {
    console.log(`[EventBus] User updated: ${payload.id}`);
    // Add user update analytics, cache invalidation, etc.
  };

  private handleUserDeleted = (payload: any): void => {
    console.log(`[EventBus] User deleted: ${payload.id}`);
    // Add cleanup, analytics, notifications, etc.
  };

  private handleUserPermissionChanged = (payload: any): void => {
    console.log(`[EventBus] User permission changed: ${payload.id} from ${payload.oldRole} to ${payload.newRole}`);
    // Add permission change notifications, cache invalidation, etc.
  };

  private handleOrganizationCreated = (payload: any): void => {
    console.log(`[EventBus] Organization created: ${payload.name}`);
    // Add organization setup, default settings, etc.
  };

  private handleOrganizationUpdated = (payload: any): void => {
    console.log(`[EventBus] Organization updated: ${payload.id}`);
    // Add organization update analytics, cache updates, etc.
  };

  private handleOrganizationDeleted = (payload: any): void => {
    console.log(`[EventBus] Organization deleted: ${payload.id}`);
    // Add cleanup, user notifications, etc.
  };

  private handleLocationCreated = (payload: any): void => {
    console.log(`[EventBus] Location created: ${payload.name}`);
    // Add location analytics, geofencing setup, etc.
  };

  private handleLocationUpdated = (payload: any): void => {
    console.log(`[EventBus] Location updated: ${payload.id}`);
    // Add location analytics, map updates, etc.
  };

  private handleLocationDeleted = (payload: any): void => {
    console.log(`[EventBus] Location deleted: ${payload.id}`);
    // Add cleanup, booking cancellations, etc.
  };

  private handleLocationApproved = (payload: any): void => {
    console.log(`[EventBus] Location approved: ${payload.id}`);
    // Add approval notifications, availability updates, etc.
  };

  private handleLocationRejected = (payload: any): void => {
    console.log(`[EventBus] Location rejected: ${payload.id}`);
    // Add rejection notifications, cleanup, etc.
  };

  private handleSystemStarted = (payload: any): void => {
    console.log(`[EventBus] System started: ${payload.version} in ${payload.environment}`);
    // Add system monitoring, health checks, etc.
  };

  private handleSystemError = (payload: any): void => {
    console.error(`[EventBus] System error: ${payload.message}`);
    // Add error reporting, alerting, etc.
  };

  private handleCircuitBreakerStateChanged = (payload: any): void => {
    console.log(`[EventBus] Circuit breaker ${payload.name} changed from ${payload.previousState} to ${payload.newState}`);
    // Add infrastructure monitoring, alerts, etc.
  };

  // Expense Event Handlers (existing)
  private handleExpenseSubmitted = (payload: any): void => {
    console.log(`[EventBus] Expense submitted: ${payload.id}`);
  };

  private handleExpenseApproved = (payload: any): void => {
    console.log(`[EventBus] Expense approved: ${payload.id}`);
  };

  private handleExpenseRejected = (payload: any): void => {
    console.log(`[EventBus] Expense rejected: ${payload.id}`);
  };

  private handleExpenseUpdated = (payload: any): void => {
    console.log(`[EventBus] Expense updated: ${payload.id}`);
  };

  private handleExpenseDeleted = (payload: any): void => {
    console.log(`[EventBus] Expense deleted: ${payload.id}`);
  };

  private handleExpensePaymentProcessed = (payload: any): void => {
    console.log(`[EventBus] Expense payment processed: ${payload.id}`);
  };

  // Additional Event Handlers
  private handleBookingCreated = (payload: any): void => {
    console.log(`[EventBus] Booking created: ${payload.id}`);
  };

  private handleBookingUpdated = (payload: any): void => {
    console.log(`[EventBus] Booking updated: ${payload.id}`);
  };

  private handleBookingApproved = (payload: any): void => {
    console.log(`[EventBus] Booking approved: ${payload.id}`);
  };

  private handleBookingRejected = (payload: any): void => {
    console.log(`[EventBus] Booking rejected: ${payload.id}`);
  };

  private handleBookingCancelled = (payload: any): void => {
    console.log(`[EventBus] Booking cancelled: ${payload.id}`);
  };

  private handleActivityCreated = (payload: any): void => {
    console.log(`[EventBus] Activity created: ${payload.id}`);
  };

  private handleActivityUpdated = (payload: any): void => {
    console.log(`[EventBus] Activity updated: ${payload.id}`);
  };

  private handleActivityCompleted = (payload: any): void => {
    console.log(`[EventBus] Activity completed: ${payload.id}`);
  };

  private handleKitCreated = (payload: any): void => {
    console.log(`[EventBus] Kit created: ${payload.id}`);
  };

  private handleKitUpdated = (payload: any): void => {
    console.log(`[EventBus] Kit updated: ${payload.id}`);
  };

  private handleKitApproved = (payload: any): void => {
    console.log(`[EventBus] Kit approved: ${payload.id}`);
  };

  private handleKitRejected = (payload: any): void => {
    console.log(`[EventBus] Kit rejected: ${payload.id}`);
  };

  private handleAuthLogin = (payload: any): void => {
    console.log(`[EventBus] User logged in: ${payload.userId}`);
  };

  private handleAuthLogout = (payload: any): void => {
    console.log(`[EventBus] User logged out: ${payload.userId}`);
  };

  private handleAuthSessionExpired = (payload: any): void => {
    console.log(`[EventBus] Session expired: ${payload.userId}`);
  };

  private handleAnalyticsEvent = (payload: any): void => {
    console.log(`[EventBus] Analytics event: ${payload.event}`);
  };

  private handleAnalyticsPageview = (payload: any): void => {
    console.log(`[EventBus] Analytics pageview: ${payload.path}`);
  };

  // Utility methods
  private generateSubscriptionId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateEventId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public getEventHistory(): Array<{ eventType: string; payload: any; metadata: EventMetadata; timestamp: Date }> {
    return [...this.eventHistory];
  }

  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  public gracefulShutdown(): void {
    console.log('EventBusService: Graceful shutdown initiated');
    this.subscriptions.clear();
    this.eventHistory.length = 0;
  }
}

// Export singleton instance
export const eventBusService = EventBusService.getInstance();