/**
 * Circuit Breaker Pattern
 *
 * This module implements the circuit breaker pattern for resilient service communication.
 * It prevents cascading failures by temporarily stopping operations when a service is failing.
 */

export enum CircuitState {
  CLOSED = &quot;closed&quot;, // Normal operation, requests pass through
  OPEN = &quot;open&quot;, // Circuit is open, requests fail fast
  HALF_OPEN = &quot;half-open&quot;, // Testing if service has recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  resetTimeout: number; // Time in ms before trying half-open
  maxRetryAttempts: number; // Max retries in half-open state
  monitorInterval: number; // Health check interval in ms
}

export interface CircuitBreakerResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  circuitState: CircuitState;
}

/**
 * Circuit Breaker implementation
 *
 * Monitors operation failures and temporarily disables operations to allow
 * failing services to recover.
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastError: Error | null = null;
  private lastStateChange: Date = new Date();
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(
    public readonly name: string,
    private readonly options: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      maxRetryAttempts: 3,
      monitorInterval: 60000, // 1 minute
    },
  ) {
    console.log(`Circuit breaker [${name}] initialized in CLOSED state`);
  }

  /**
   * Execute an operation protected by the circuit breaker
   *
   * @param operation Function to execute
   * @returns Result with success/failure and data
   */
  async execute<T>(
    operation: () => Promise<T>,
  ): Promise<CircuitBreakerResult<T>> {
    // If circuit is open, fail fast
    if (this.state === CircuitState.OPEN) {
      const timeSinceLastStateChange =
        new Date().getTime() - this.lastStateChange.getTime();

      // Check if it&apos;s time to try recovery
      if (timeSinceLastStateChange >= this.options.resetTimeout) {
        this.transitionToHalfOpen();
      } else {
        return {
          success: false,
          error: new Error(`Circuit breaker [${this.name}] is OPEN`),
          circuitState: this.state,
        };
      }
    }

    try {
      // Attempt the operation
      const result = await operation();

      // Record success
      this.recordSuccess();

      return {
        success: true,
        data: result,
        circuitState: this.state,
      };
    } catch (error) {
      // Record failure
      this.recordFailure(
        error instanceof Error ? error : new Error(String(error)),
      );

      return {
        success: false,
        error: this.lastError!,
        circuitState: this.state,
      };
    }
  }

  /**
   * Get the current state of the circuit breaker
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset the circuit breaker to CLOSED state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastError = null;
    this.lastStateChange = new Date();

    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }

    console.log(
      `Circuit breaker [${this.name}] manually reset to CLOSED state`,
    );
  }

  /**
   * Record a successful operation
   */
  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      // If we've had enough successes in half-open state, close the circuit
      if (this.successCount >= this.options.maxRetryAttempts) {
        this.transitionToClosed();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed operation
   */
  private recordFailure(error: Error): void {
    this.lastError = error;

    if (this.state === CircuitState.CLOSED) {
      this.failureCount++;

      // If we've reached the failure threshold, open the circuit
      if (this.failureCount >= this.options.failureThreshold) {
        this.transitionToOpen();
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      // If we fail in half-open state, immediately open the circuit again
      this.transitionToOpen();
    }
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastStateChange = new Date();

    console.log(
      `Circuit breaker [${this.name}] OPENED due to failures. Last error: ${this.lastError?.message}`,
    );

    // Schedule a transition to HALF_OPEN after resetTimeout
    this.resetTimer = setTimeout(() => {
      this.transitionToHalfOpen();
    }, this.options.resetTimeout);
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.lastStateChange = new Date();

    console.log(
      `Circuit breaker [${this.name}] in HALF-OPEN state, testing service recovery`,
    );
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastStateChange = new Date();

    console.log(
      `Circuit breaker [${this.name}] CLOSED, normal operations resumed`,
    );
  }
}

/**
 * Registry to manage circuit breaker instances
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get an existing circuit breaker or create a new one
   *
   * @param name Circuit breaker name/identifier
   * @param options Optional configuration
   * @returns The circuit breaker instance
   */
  getOrCreate(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(name, options);
      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name)!;
  }

  /**
   * Get all registered circuit breakers
   *
   * @returns Map of all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  /**
   * Reset all circuit breakers to CLOSED state
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Export the singleton registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry();
