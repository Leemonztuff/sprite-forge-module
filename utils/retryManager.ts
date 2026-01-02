/**
 * Retry mechanisms for failed operations
 * Implements exponential backoff and circuit breaker patterns
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly originalError: any,
    public readonly totalDelayMs: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Generic retry utility with exponential backoff
 */
export class RetryManager {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2
  };

  /**
   * Execute operation with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: any;
    let totalDelay = 0;

    for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
      try {
        // Execute operation
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), 30000)
          )
        ]);

        // Log successful retry if applicable
        if (attempt > 0 && fullConfig.onRetry) {
          fullConfig.onRetry(attempt, null);
        }

        return result;

      } catch (error) {
        lastError = error;

        // Check if we should retry this error
        const shouldRetry = fullConfig.retryCondition 
          ? fullConfig.retryCondition(error)
          : this.defaultRetryCondition(error);

        if (!shouldRetry || attempt === fullConfig.maxRetries) {
          // No more retries
          throw new RetryError(
            `Operation failed after ${attempt + 1} attempts: ${error.message}`,
            attempt + 1,
            error,
            totalDelay
          );
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          fullConfig.baseDelayMs * Math.pow(fullConfig.backoffFactor, attempt),
          fullConfig.maxDelayMs
        );

        totalDelay += delay;

        // Log retry attempt
        console.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${fullConfig.maxRetries + 1}):`, error);

        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt + 1, error);
        }

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new RetryError(
      'Unexpected retry failure',
      fullConfig.maxRetries + 1,
      lastError,
      totalDelay
    );
  }

  /**
   * Default retry condition - retry on network errors and 5xx status
   */
  private static defaultRetryCondition(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    
    // Network errors
    if (message.includes('network') || 
        message.includes('fetch') || 
        message.includes('timeout') ||
        message.includes('connection')) {
      return true;
    }

    // HTTP status errors
    if (error.status) {
      return error.status >= 500 || error.status === 429;
    }

    // API specific errors
    if (message.includes('quota') || 
        message.includes('rate') ||
        message.includes('temporary') ||
        message.includes('busy')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep utility for delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitBreakerError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      
      // Success - reset failure count
      this.onSuccess();
      return result;

    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs;
  }
}

/**
 * Specialized retry managers for different operation types
 */

export class AIRetryManager {
  private static readonly AI_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 2000,
    maxDelayMs: 30000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      const message = error.message?.toLowerCase() || '';
      
      // Retry on quota/rate limiting
      if (message.includes('quota') || 
          message.includes('429') || 
          message.includes('rate') ||
          message.includes('resource exhausted')) {
        return true;
      }

      // Retry on temporary API errors
      if (message.includes('temporary') || 
          message.includes('busy') ||
          message.includes('try again')) {
        return true;
      }

      // HTTP 5xx errors
      if (error.status >= 500) {
        return true;
      }

      return false;
    }
  };

  /**
   * Retry AI generation with specific logic
   */
  static async executeAIOperation<T>(
    operation: () => Promise<T>,
    onProgress?: (attempt: number, total: number) => void
  ): Promise<T> {
    return RetryManager.executeWithRetry(operation, {
      ...this.AI_RETRY_CONFIG,
      onRetry: (attempt, error) => {
        if (onProgress) {
          onProgress(attempt, this.AI_RETRY_CONFIG.maxRetries + 1);
        }

        // Log specific AI retry info
        console.warn(`AI operation retry ${attempt}:`, {
          error: error?.message || 'Unknown error',
          nextAttemptIn: this.calculateDelay(attempt)
        });
      }
    });
  }

  private static calculateDelay(attempt: number): number {
    return Math.min(
      this.AI_RETRY_CONFIG.baseDelayMs * Math.pow(this.AI_RETRY_CONFIG.backoffFactor, attempt - 1),
      this.AI_RETRY_CONFIG.maxDelayMs
    );
  }
}

export class NetworkRetryManager {
  private static readonly NETWORK_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 15000,
    backoffFactor: 1.5,
    retryCondition: (error: any) => {
      // Retry on all network errors
      if (error.name === 'TypeError' || 
          error.name === 'NetworkError' ||
          error.message?.toLowerCase().includes('fetch')) {
        return true;
      }

      // Retry on timeout
      if (error.message?.toLowerCase().includes('timeout')) {
        return true;
      }

      return false;
    }
  };

  /**
   * Retry network operations
   */
  static async executeNetworkOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return RetryManager.executeWithRetry(operation, this.NETWORK_RETRY_CONFIG);
  }
}

export class DatabaseRetryManager {
  private static readonly DB_RETRY_CONFIG: RetryConfig = {
    maxRetries: 2,
    baseDelayMs: 100,
    maxDelayMs: 5000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      // Retry on connection errors
      if (error.code === 'PGRST301' || // Connection refused
          error.code === 'PGRST302' || // Connection timeout
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT') {
        return true;
      }

      return false;
    }
  };

  /**
   * Retry database operations
   */
  static async executeDatabaseOperation<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return RetryManager.executeWithRetry(operation, this.DB_RETRY_CONFIG);
  }
}

/**
 * Hook for using retry logic in React components
 */
export function useRetry<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  config?: Partial<RetryConfig>
) {
  const [isLoading, setIsLoading] = [false, (v: boolean) => {}];
  const [error, setError] = [null, (e: Error | null) => {}];
  const [data, setData] = [null, (d: R | null) => {}];

  const execute = async (...args: T) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await RetryManager.executeWithRetry(
        () => operation(...args),
        config
      );
      
      setData(result);
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;

    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  return {
    execute,
    reset,
    isLoading,
    error,
    data
  };
}

/**
 * Retry with timeout and cancellation support
 */
export function createCancellableRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  timeoutMs: number = 30000
) {
  const abortController = new AbortController();

  const cancellableOperation = async (): Promise<T> => {
    if (abortController.signal.aborted) {
      throw new Error('Operation was cancelled');
    }

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Operation was cancelled'));
        });

        setTimeout(() => {
          if (!abortController.signal.aborted) {
            reject(new Error('Operation timeout'));
          }
        }, timeoutMs);
      })
    ]);
  };

  const execute = () => RetryManager.executeWithRetry(cancellableOperation, config);
  const cancel = () => abortController.abort();

  return { execute, cancel, isCancelled: () => abortController.signal.aborted };
}

// Export utilities
export const {
  executeWithRetry
} = RetryManager;

export default RetryManager;