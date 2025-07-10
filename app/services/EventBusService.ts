export interface Event {
  type: string;
  userId?: string;
  organizationId?: string;
  timestamp: Date;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export class EventBusService {
  private static instance: EventBusService;
  private events: Event[] = [];
  private handlers: Map<string, ((event: Event) => void)[]> = new Map();

  private constructor() {
    this.events = [];
    this.handlers = new Map();
  }

  static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  static publish(event: Event): void {
    const instance = EventBusService.getInstance();
    instance.publish(event);
  }

  publish(event: Event): void {
    // Add correlation ID if not present
    if (!event.correlationId) {
      event.correlationId = this.generateCorrelationId();
    }

    // Store event for audit trail
    this.events.push(event);

    // Notify handlers
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    });

    // Log event in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[EventBus] Published: ${event.type}`, {
        correlationId: event.correlationId,
        userId: event.userId,
        timestamp: event.timestamp,
      });
    }
  }

  subscribe(eventType: string, handler: (event: Event) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  getHealthStatus() {
    return {
      eventStoreSize: this.events.length,
      handlersCount: this.handlers.size,
      isShuttingDown: false,
    };
  }

  getCircuitBreakerState() {
    return "closed"; // Simplified for development
  }

  private generateCorrelationId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get recent events for debugging
  getRecentEvents(limit = 50): Event[] {
    return this.events.slice(-limit);
  }
}

export default EventBusService;
