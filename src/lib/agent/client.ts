import OpenAI from 'openai';

/**
 * OpenAI Client for Unwind AI Agent
 *
 * Configured to use GPT-4o with the Assistants API for:
 * - Streaming conversations
 * - Function calling (12 mental health data tools)
 * - Thread-based conversation management
 */

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'Missing OPENAI_API_KEY environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get the configured Assistant ID
 * This should be created once and stored in environment variables
 */
export function getAssistantId(): string {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  if (!assistantId) {
    throw new Error(
      'Missing OPENAI_ASSISTANT_ID environment variable. ' +
      'Create an assistant first using the setup script.'
    );
  }

  return assistantId;
}

/**
 * Retry configuration for OpenAI API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 4000,
  backoffMultiplier: 2,
} as const;

/**
 * Timeout configuration for tool execution
 */
export const TIMEOUT_CONFIG = {
  toolExecutionMs: 10000, // 10 seconds max per tool
  streamingMs: 60000,     // 60 seconds for streaming responses
} as const;

/**
 * Helper function to implement exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string = 'OpenAI API call'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof OpenAI.APIError) {
        // Don't retry on 400-level errors (except rate limits)
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
        RETRY_CONFIG.maxDelayMs
      );

      console.warn(
        `${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}). ` +
        `Retrying in ${delay}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `${context} failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError?.message}`
  );
}
