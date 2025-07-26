/**
 * Circuit Breaker Service for Microservices Resilience
 * Implements the Circuit Breaker pattern for service fault tolerance
 */

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  successThreshold: number;
}

export interface CircuitBreakerStats {
  failures: number;
  successes: number;
  requests: number;
  lastFailureTime: number;
  lastSuccessTime: number;
}

export class CircuitBreakerService {
  private static instance: CircuitBreakerService;
  private circuits: Map<string, {
    state: CircuitState;
    config: CircuitBreakerConfig;
    stats: CircuitBreakerStats;
    nextAttempt: number;
  }> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerService {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  registerCircuit(name: string, config: CircuitBreakerConfig): void {
    this.circuits.set(name, {
      state: CircuitState.CLOSED,
      config,
      stats: {
        failures: 0,
        successes: 0,
        requests: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
      },
      nextAttempt: 0,
    });
  }

  async executeWithCircuitBreaker<T>(
    circuitName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) {
      throw new Error(`Circuit breaker '${circuitName}' not registered`);
    }

    // Check if circuit is open
    if (circuit.state === CircuitState.OPEN) {
      if (Date.now() < circuit.nextAttempt) {
        if (fallback) {
          return await fallback();
        }
        throw new Error(`Circuit breaker '${circuitName}' is OPEN`);
      }
      // Move to half-open state
      circuit.state = CircuitState.HALF_OPEN;
    }

    circuit.stats.requests++;

    try {
      const result = await operation();
      this.onSuccess(circuitName);
      return result;
    } catch (error) {
      this.onFailure(circuitName);
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }

  private onSuccess(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return;

    circuit.stats.successes++;
    circuit.stats.lastSuccessTime = Date.now();

    if (circuit.state === CircuitState.HALF_OPEN) {
      if (circuit.stats.successes >= circuit.config.successThreshold) {
        circuit.state = CircuitState.CLOSED;
        this.resetStats(circuitName);
      }
    }
  }

  private onFailure(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return;

    circuit.stats.failures++;
    circuit.stats.lastFailureTime = Date.now();

    if (circuit.stats.failures >= circuit.config.failureThreshold) {
      circuit.state = CircuitState.OPEN;
      circuit.nextAttempt = Date.now() + circuit.config.resetTimeout;
    }
  }

  private resetStats(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return;

    circuit.stats.failures = 0;
    circuit.stats.successes = 0;
  }

  getCircuitState(circuitName: string): CircuitState | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? circuit.state : null;
  }

  getCircuitStats(circuitName: string): CircuitBreakerStats | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? { ...circuit.stats } : null;
  }

  getAllCircuits(): Array<{
    name: string;
    state: CircuitState;
    stats: CircuitBreakerStats;
  }> {
    return Array.from(this.circuits.entries()).map(([name, circuit]) => ({
      name,
      state: circuit.state,
      stats: { ...circuit.stats },
    }));
  }
}