// Circuit Breaker Service for Production Resilience
// Prevents cascading failures in microservices architecture

import { v4 as uuidv4 } from "uuid";

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export interface CircuitBreakerMetrics {
  totalCalls: number;
  failedCalls: number;
  successfulCalls: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
}

export class CircuitBreakerService {
  private state: CircuitState = CircuitState.CLOSED;
  private metrics: CircuitBreakerMetrics = {
    totalCalls: 0,
    failedCalls: 0,
    successfulCalls: 0,
  };
  private lastFailureTime?: Date;
  private halfOpenCalls = 0;
  private readonly id = uuidv4();

  constructor(
    private readonly serviceName: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      halfOpenMaxCalls: 3,
    },
  ) {
    this.startMonitoring();
  }

  // Execute function with circuit breaker protection
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
        console.log(`Circuit breaker ${this.serviceName} moving to HALF_OPEN`);
      } else {
        console.warn(
          `Circuit breaker ${this.serviceName} is OPEN, using fallback`,
        );
        if (fallback) {
          return await fallback();
        }
        throw new Error(
          `Circuit breaker ${this.serviceName} is OPEN and no fallback provided`,
        );
      }
    }

    if (
      this.state === CircuitState.HALF_OPEN &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      console.warn(
        `Circuit breaker ${this.serviceName} HALF_OPEN call limit reached`,
      );
      if (fallback) {
        return await fallback();
      }
      throw new Error(
        `Circuit breaker ${this.serviceName} HALF_OPEN call limit exceeded`,
      );
    }

    try {
      this.metrics.totalCalls++;
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenCalls++;
      }

      const result = await operation();

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      if (fallback) {
        console.warn(
          `Operation failed, using fallback for ${this.serviceName}:`,
          error,
        );
        return await fallback();
      }

      throw error;
    }
  }

  private onSuccess(): void {
    this.metrics.successfulCalls++;
    this.metrics.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // Reset to closed after successful calls in half-open state
      this.state = CircuitState.CLOSED;
      this.halfOpenCalls = 0;
      console.log(`Circuit breaker ${this.serviceName} reset to CLOSED`);
    }

    // Reset failure count on success
    this.metrics.failedCalls = 0;
  }

  private onFailure(): void {
    this.metrics.failedCalls++;
    this.metrics.lastFailureTime = new Date();
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // Go back to open on any failure in half-open state
      this.state = CircuitState.OPEN;
      console.warn(
        `Circuit breaker ${this.serviceName} failed in HALF_OPEN, returning to OPEN`,
      );
      return;
    }

    if (
      this.state === CircuitState.CLOSED &&
      this.metrics.failedCalls >= this.config.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      console.error(
        `Circuit breaker ${this.serviceName} opened due to ${this.metrics.failedCalls} failures`,
      );
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.recoveryTimeout;
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.resetMetricsIfNeeded();
    }, this.config.monitoringPeriod);
  }

  private resetMetricsIfNeeded(): void {
    const now = Date.now();
    const lastActivity = Math.max(
      this.metrics.lastFailureTime?.getTime() || 0,
      this.metrics.lastSuccessTime?.getTime() || 0,
    );

    if (now - lastActivity > this.config.monitoringPeriod) {
      // Reset metrics for inactive periods
      this.metrics = {
        totalCalls: 0,
        failedCalls: 0,
        successfulCalls: 0,
        lastFailureTime: this.metrics.lastFailureTime,
        lastSuccessTime: this.metrics.lastSuccessTime,
      };
    }
  }

  // Get current circuit breaker status
  getStatus() {
    return {
      id: this.id,
      serviceName: this.serviceName,
      state: this.state,
      metrics: { ...this.metrics },
      config: { ...this.config },
      halfOpenCalls: this.halfOpenCalls,
    };
  }

  // Force circuit breaker state (for testing/admin purposes)
  setState(newState: CircuitState): void {
    console.log(
      `Circuit breaker ${this.serviceName} state manually changed from ${this.state} to ${newState}`,
    );
    this.state = newState;
    if (newState === CircuitState.CLOSED) {
      this.metrics.failedCalls = 0;
      this.halfOpenCalls = 0;
    }
  }
}

// Circuit Breaker Registry for managing multiple service circuit breakers
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers = new Map<string, CircuitBreakerService>();

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  getOrCreate(
    serviceName: string,
    config?: CircuitBreakerConfig,
  ): CircuitBreakerService {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(
        serviceName,
        new CircuitBreakerService(serviceName, config),
      );
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  getAllStatus() {
    const status: Record<string, any> = {};
    for (const [name, breaker] of this.circuitBreakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }

  // Health check endpoint data
  getHealthSummary() {
    const breakers = Array.from(this.circuitBreakers.values());
    const openBreakers = breakers.filter(
      (b) => b.getStatus().state === CircuitState.OPEN,
    );

    return {
      totalCircuitBreakers: breakers.length,
      openCircuitBreakers: openBreakers.length,
      healthStatus: openBreakers.length === 0 ? "healthy" : "degraded",
      openServices: openBreakers.map((b) => b.getStatus().serviceName),
    };
  }
}
