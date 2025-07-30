/**
 * Location Service Circuit Breaker
 *
 * Applies the circuit breaker pattern to location-related service calls
 * to prevent cascading failures and provide graceful degradation
 */

import { circuitBreakerRegistry } from &quot;../infrastructure/patterns/circuitBreaker&quot;;
import { LocationDTO } from &quot;./models&quot;;

// Circuit breakers for different location service operations
const LOCATION_SERVICE_CIRCUITS = {
  GEOCODING: &quot;location-service.geocoding&quot;,
  CREATE: &quot;location-service.create&quot;,
  UPDATE: &quot;location-service.update&quot;,
  APPROVAL: &quot;location-service.approval&quot;,
  FETCH: &quot;location-service.fetch&quot;,
  DELETE: &quot;location-service.delete&quot;,
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
      throw new Error(&quot;Geocoding circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Geocoding operation failed&quot;);
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
      throw new Error(&quot;Create location circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Create location operation failed&quot;);
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
      throw new Error(&quot;Update location circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Update location operation failed&quot;);
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
      throw new Error(&quot;Approval circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Approval operation failed&quot;);
    }

    return result.data!;
  }

  /**
   * Execute a fetch data operation with circuit breaker protection
   */
  async executeFetchOperation<T>(operation: () => Promise<T>): Promise<T> {
    const circuit = circuitBreakerRegistry.get(LOCATION_SERVICE_CIRCUITS.FETCH);
    if (!circuit) {
      throw new Error(&quot;Fetch circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Fetch operation failed&quot;);
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
      throw new Error(&quot;Delete circuit breaker not initialized&quot;);
    }

    const result = await circuit.execute(operation);

    if (!result.success) {
      throw result.error || new Error(&quot;Delete operation failed&quot;);
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
          status[circuitName] = { state: &quot;not-initialized&quot; };
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
