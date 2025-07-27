/**
 * Resilience utilities for handling retries, circuit breakers, and fault tolerance
 */

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryExecutor {
  private maxRetries: number;
  private delay: number;
  private backoff: 'linear' | 'exponential';
  private onRetry?: (attempt: number, error: Error) => void;

  constructor(options: RetryOptions) {
    this.maxRetries = options.maxRetries;
    this.delay = options.delay;
    this.backoff = options.backoff || 'linear';
    this.onRetry = options.onRetry;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          throw lastError;
        }
        
        if (this.onRetry) {
          this.onRetry(attempt + 1, lastError);
        }
        
        await this.wait(attempt + 1);
      }
    }
    
    throw lastError!;
  }

  private async wait(attempt: number): Promise<void> {
    let waitTime = this.delay;
    
    if (this.backoff === 'exponential') {
      waitTime = this.delay * Math.pow(2, attempt - 1);
    } else if (this.backoff === 'linear') {
      waitTime = this.delay * attempt;
    }
    
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

export function createRetryExecutor(options: RetryOptions): RetryExecutor {
  return new RetryExecutor(options);
}