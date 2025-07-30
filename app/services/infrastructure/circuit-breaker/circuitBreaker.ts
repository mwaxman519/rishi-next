/**
 * Circuit Breaker Pattern
 *
 * Implements the circuit breaker pattern for protecting services from cascading failures:
 * - Detects when a service is failing
 * - Prevents further calls to the failing service
 * - Allows the service time to recover
 * - Provides fallback mechanisms during service outages
 */

/**
 * Circuit states
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Circuit is broken, requests are not sent to the service
 * - HALF_OPEN: Testing if the service has recovered
 */
export enum CircuitState {
  CLOSED = &quot;CLOSED&quot;,
  OPEN = &quot;OPEN&quot;,
  HALF_OPEN = &quot;HALF_OPEN&quot;,
}

// Circuit breaker options
export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  resetTimeout: number; // Time (ms) to wait before half-open
  halfOpenSuccessThreshold: number; // Successful calls in half-open before closing
  monitorInterval?: number; // Interval (ms) to check health
  timeout?: number; // Timeout (ms) for individual calls
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  ignoreErrors?: (error: Error) => boolean; // Predicate for errors to ignore
}

// Circuit breaker stats
export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: Error;
  lastFailureTime?: Date;
  lastSuccess?: any;
  lastSuccessTime?: Date;
  halfOpenSuccesses: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  startTime: Date;
  uptime: number; // milliseconds
}

// Generic function type that the circuit breaker can wrap
export type CircuitFunction<T> = (...args: any[]) => Promise<T>;

// Fallback function type that is called when the circuit is open
export type FallbackFunction<T> = (error: Error, ...args: any[]) => Promise<T>;

/**
 * CircuitBreaker class
 *
 * Implements a circuit breaker pattern to protect against failures of a service
 */
export class CircuitBreaker<T = any> {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private halfOpenSuccesses: number = 0;
  private lastFailure?: Error;
  private lastFailureTime?: Date;
  private lastSuccess?: T;
  private lastSuccessTime?: Date;
  private resetTimer?: NodeJS.Timeout;
  private monitorInterval?: NodeJS.Timeout;
  private totalCalls: number = 0;
  private successfulCalls: number = 0;
  private failedCalls: number = 0;
  private rejectedCalls: number = 0;
  private startTime: Date = new Date();

  constructor(
    private service: string,
    private protectedFunction: CircuitFunction<T>,
    private options: CircuitBreakerOptions,
    private fallback?: FallbackFunction<T>,
  ) {
    // Start health monitoring if interval specified
    if (options.monitorInterval) {
      this.monitorInterval = setInterval(
        () => this.checkHealth(),
        options.monitorInterval,
      );
    }
  }

  /**
   * Execute the protected function with circuit breaker protection
   *
   * @param args Arguments to pass to the protected function
   * @returns The result of the protected function or fallback
   * @throws Error if the circuit is open and no fallback is provided
   */
  async execute(...args: any[]): Promise<T> {
    this.totalCalls++;

    // If circuit is open, don&apos;t call the service
    if (this.state === CircuitState.OPEN) {
      this.rejectedCalls++;

      if (this.fallback) {
        // Use fallback if provided
        const error = new Error(
          `Circuit for service '${this.service}' is OPEN`,
        );
        return this.fallback(error, ...args);
      }

      throw new Error(
        `Service '${this.service}' is unavailable (circuit OPEN)`,
      );
    }

    try {
      // With timeout if configured
      let result: T;

      if (this.options.timeout) {
        result = await Promise.race([
          this.protectedFunction(...args),
          new Promise<T>((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Service '${this.service}' timed out after ${this.options.timeout}ms`,
                  ),
                ),
              this.options.timeout,
            );
          }),
        ]);
      } else {
        result = await this.protectedFunction(...args);
      }

      // Record successful call
      this.handleSuccess(result);

      return result;
    } catch (error) {
      // Record failure
      this.handleFailure(
        error instanceof Error ? error : new Error(String(error)),
      );

      // Use fallback if provided
      if (this.fallback) {
        return this.fallback(
          error instanceof Error ? error : new Error(String(error)),
          ...args,
        );
      }

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Handle a successful call
   */
  private handleSuccess(result: T): void {
    this.successfulCalls++;
    this.successes++;
    this.lastSuccess = result;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses++;

      // If we've reached the success threshold in half-open state, close the circuit
      if (this.halfOpenSuccesses >= this.options.halfOpenSuccessThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Handle a failed call
   */
  private handleFailure(error: Error): void {
    this.failedCalls++;

    // Check if this error should be ignored for circuit breaker purposes
    if (this.options.ignoreErrors && this.options.ignoreErrors(error)) {
      return;
    }

    this.failures++;
    this.lastFailure = error;
    this.lastFailureTime = new Date();

    // In closed state, check if we need to open the circuit
    if (
      this.state === CircuitState.CLOSED &&
      this.failures >= this.options.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
    }
    // In half-open state, a single failure will re-open the circuit
    else if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    // Reset counters when transitioning
    if (newState === CircuitState.OPEN) {
      // When opening, set a timer to go to half-open
      if (this.resetTimer) {
        clearTimeout(this.resetTimer);
      }

      this.resetTimer = setTimeout(() => {
        this.transitionTo(CircuitState.HALF_OPEN);
      }, this.options.resetTimeout);
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenSuccesses = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.successes = 0;
    }

    // Notify of state change
    if (this.options.onStateChange) {
      this.options.onStateChange(oldState, newState);
    }

    console.log(
      `Circuit '${this.service}' changed from ${oldState} to ${newState}`,
    );
  }

  /**
   * Check the health of the service
   *
   * This is a proactive check that can be done periodically to see
   * if the service has recovered without waiting for a user request.
   */
  private async checkHealth(): Promise<void> {
    if (this.state !== CircuitState.OPEN) {
      return;
    }

    // Try to put the circuit in half-open state
    this.transitionTo(CircuitState.HALF_OPEN);
  }

  /**
   * Force a specific state (useful for testing and manual control)
   */
  forceState(state: CircuitState): void {
    this.transitionTo(state);
  }

  /**
   * Reset the circuit breaker to its initial state
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
    this.failures = 0;
    this.successes = 0;
    this.halfOpenSuccesses = 0;
    this.lastFailure = undefined;
    this.lastFailureTime = undefined;
    this.lastSuccess = undefined;
    this.lastSuccessTime = undefined;
  }

  /**
   * Get the current state of the circuit breaker
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get complete statistics about the circuit breaker
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastFailureTime: this.lastFailureTime,
      lastSuccess: this.lastSuccess,
      lastSuccessTime: this.lastSuccessTime,
      halfOpenSuccesses: this.halfOpenSuccesses,
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      failedCalls: this.failedCalls,
      rejectedCalls: this.rejectedCalls,
      startTime: this.startTime,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }

    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
  }
}
