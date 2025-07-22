/**
 * Resilience Utilities
 * Provides circuit breaker, retry, and error handling functionality
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

/**
 * Simple circuit breaker implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime >= this.config.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();
      
      if (this.failures >= this.config.failureThreshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}

/**
 * Retry with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        config.baseDelay * Math.pow(config.exponentialBase, attempt - 1),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  static async handleAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      console.error('Async operation failed:', error);
      return fallback;
    }
  }

  static handleSync<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      console.error('Sync operation failed:', error);
      return fallback;
    }
  }
}

// Default export for compatibility
export default {
  CircuitBreaker,
  withRetry,
  ErrorHandler,
};