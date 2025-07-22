/**
 * Location Service Circuit Breaker
 *
 * Applies the circuit breaker pattern to location-related service calls
 * to prevent cascading failures and provide graceful degradation
 */

import { circuitBreakerRegistry } from "../infrastructure/patterns/circuitBreaker";
import { LocationDTO } from "./models";

// Circuit breakers for different location service operations
const LOCATION_SERVICE_CIRCUITS = {
  GEOCODING: "location-service.geocoding",
  CREATE: "location-service.create",
  UPDATE: "location-service.update",
  APPROVAL: "location-service.approval",
  FETCH: "location-service.fetch",
  DELETE: "location-service.delete",
};

/**
 * Location service circuit breaker wrapper
 *
 * Provides a wrapper around location service methods with circuit breaker protection
 */
export class LocationCircuitBreaker {
  constructor() {
    // Initialize all the circuit breakers with appropriate configurations
    this.initCircuitBreakers();
  }

  /**
   * Initialize all circuit breakers used by the location service
   */
  private initCircuitBreakers(): void {
    // Geocoding operations - more lenient settings since geocoding can be flaky
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.GEOCODING, {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      successThreshold: 2,
      operationTimeout: 10000, // 10 seconds
    });

    // Create location operations
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.CREATE, {
      failureThreshold: 3,
      resetTimeout: 60000, // 1 minute
      successThreshold: 1,
      operationTimeout: 15000, // 15 seconds
    });

    // Update location operations
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.UPDATE, {
      failureThreshold: 3,
      resetTimeout: 60000, // 1 minute
      successThreshold: 1,
      operationTimeout: 10000, // 10 seconds
    });

    // Approval workflow operations
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.APPROVAL, {
      failureThreshold: 2,
      resetTimeout: 60000, // 1 minute
      successThreshold: 2,
      operationTimeout: 10000, // 10 seconds
    });

    // Data fetching operations
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.FETCH, {
      failureThreshold: 5, // More lenient for read operations
      resetTimeout: 30000, // 30 seconds
      successThreshold: 1,
      operationTimeout: 5000, // 5 seconds
    });

    // Delete operations
    circuitBreakerRegistry.getOrCreate(LOCATION_SERVICE_CIRCUITS.DELETE, {
      failureThreshold: 3,
      resetTimeout: 60000, // 1 minute
      successThreshold: 1,
      operationTimeout: 10000, // 10 seconds
    });
  }

  /**
   * Execute a geocoding operation with circuit breaker protection
   */
  async executeGeocodingOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(
      LOCATION_SERVICE_CIRCUITS.GEOCODING,
    );
    if (!circuit) {
      throw new Error("Geocoding circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Geocoding operation failed");
    }

    return result.data!;
  }

  /**
   * Execute a create location operation with circuit breaker protection
   */
  async executeCreateOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(
      LOCATION_SERVICE_CIRCUITS.CREATE,
    );
    if (!circuit) {
      throw new Error("Create location circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Create location operation failed");
    }

    return result.data!;
  }

  /**
   * Execute an update location operation with circuit breaker protection
   */
  async executeUpdateOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(
      LOCATION_SERVICE_CIRCUITS.UPDATE,
    );
    if (!circuit) {
      throw new Error("Update location circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Update location operation failed");
    }

    return result.data!;
  }

  /**
   * Execute an approval workflow operation with circuit breaker protection
   */
  async executeApprovalOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(
      LOCATION_SERVICE_CIRCUITS.APPROVAL,
    );
    if (!circuit) {
      throw new Error("Approval circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Approval operation failed");
    }

    return result.data!;
  }

  /**
   * Execute a fetch data operation with circuit breaker protection
   */
  async executeFetchOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(LOCATION_SERVICE_CIRCUITS.FETCH);
    if (!circuit) {
      throw new Error("Fetch circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Fetch operation failed");
    }

    return result.data!;
  }

  /**
   * Execute a delete operation with circuit breaker protection
   */
  async executeDeleteOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(
      LOCATION_SERVICE_CIRCUITS.DELETE,
    );
    if (!circuit) {
      throw new Error("Delete circuit breaker not initialized");
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error("Delete operation failed");
    }

    return result.data!;
  }

  /**
   * Get the health status of all location service circuit breakers
   */
  getCircuitStatus(): Record<string, any> {
    return Object.values(LOCATION_SERVICE_CIRCUITS).reduce(
      (status, circuitName) => {
        const circuit = circuitBreakerRegistry.get(circuitName);
        if (circuit) {
          status[circuitName] = {
            state: circuit.getState(),
            ...circuit.getHealth(),
          };
        } else {
          status[circuitName] = { state: "not-initialized" };
        }
        return status;
      },
      {} as Record<string, any>,
    );
  }

  /**
   * Reset all location service circuit breakers
   */
  resetAllCircuits(): void {
    Object.values(LOCATION_SERVICE_CIRCUITS).forEach((circuitName) => {
      const circuit = circuitBreakerRegistry.get(circuitName);
      if (circuit) {
        circuit.reset();
      }
    });
  }
}

// Export a singleton instance
export const locationCircuitBreaker = new LocationCircuitBreaker();
