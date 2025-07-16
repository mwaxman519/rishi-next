/**
 * EventBusService - Backwards Compatibility Wrapper
 * 
 * This file provides backwards compatibility for any remaining imports
 * while the system transitions to the unified AdvancedEventBus
 */

// Re-export the advanced event bus for complete backwards compatibility
export { advancedEventBus as eventBusService } from "./infrastructure/AdvancedEventBus";

// Legacy class export for any class-based imports
export class EventBusService {
  private static instance: any;
  
  static getInstance() {
    if (!EventBusService.instance) {
      const { advancedEventBus } = require("./infrastructure/AdvancedEventBus");
      EventBusService.instance = advancedEventBus;
    }
    return EventBusService.instance;
  }
  
  // Static method for direct access
  static publish(eventData: any) {
    const instance = EventBusService.getInstance();
    
    // Handle both object format and separate parameters
    if (typeof eventData === 'object' && eventData.type) {
      return instance.publish(eventData.type, eventData, {});
    }
    
    // Handle direct parameters
    return instance.publish(eventData, {}, {});
  }
  
  // Delegate all methods to the advanced event bus
  publish(eventType: string, payload: any, options?: any) {
    return EventBusService.getInstance().publish(eventType, payload, options);
  }
  
  subscribe(eventType: string, handler: any, options?: any) {
    return EventBusService.getInstance().subscribe(eventType, handler, options);
  }
  
  unsubscribe(eventType: string, subscriptionId: string) {
    return EventBusService.getInstance().unsubscribe(eventType, subscriptionId);
  }
  
  getMetrics() {
    return EventBusService.getInstance().getMetrics();
  }
  
  initialize() {
    return EventBusService.getInstance().initialize();
  }
}

// Default export for ES6 imports
export default EventBusService;