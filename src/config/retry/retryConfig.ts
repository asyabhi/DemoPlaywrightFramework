import { Page } from '@playwright/test';
import logger from '../../utils/logging/loggerManager';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

export class RetryHandler {
  private static readonly DEFAULT_MAX_ATTEMPTS = 2;
  private static readonly DEFAULT_DELAY_MS = 1000;

  /**
   * Retry an operation with exponential backoff
   */
  static async withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      delayMs = this.DEFAULT_DELAY_MS,
      exponentialBackoff = true,
      onRetry,
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          logger.error(`Operation failed after ${maxAttempts} attempts: ${error}`);
          throw error;
        }

        const delay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

        logger.warn(`Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`);

        if (onRetry) {
          onRetry(attempt, error);
        }

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Retry page navigation with reload fallback
   */
  static async retryNavigation(page: Page, url: string, options: RetryOptions = {}): Promise<void> {
    await this.withRetry(
      async () => {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        if (!response || !response.ok()) {
          throw new Error(`Navigation failed with status: ${response?.status()}`);
        }
      },
      {
        ...options,
        onRetry: (attempt) => {
          logger.info(`Navigation retry attempt ${attempt} for: ${url}`);
        },
      },
    );
  }

  /**
   * Retry element interaction with stale element handling
   */
  static async retryElementAction<T>(
    action: () => Promise<T>,
    elementDescription: string,
    options: RetryOptions = {},
  ): Promise<T> {
    return this.withRetry(action, {
      ...options,
      onRetry: (attempt, error) => {
        logger.warn(`Retrying ${elementDescription} action (attempt ${attempt}): ${error}`);
      },
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
