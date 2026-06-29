/**
 * Gemini error classifier.
 *
 * Maps raw @google/generative-ai SDK errors to safe, user-facing messages.
 * Raw error messages (which can contain prompt fragments or internal details)
 * are never exposed to the client.
 *
 * HTTP status mapping:
 *   429 — RESOURCE_EXHAUSTED: rate limit or quota exceeded
 *   503 — UNAVAILABLE: model overloaded, retry later
 *   400 — INVALID_ARGUMENT: bad request (prompt too long, blocked content)
 *   401 — UNAUTHENTICATED: invalid API key
 *   5xx — Generic server error
 */
import 'server-only';

import { GoogleGenerativeAIFetchError } from '@google/generative-ai';

export interface GeminiErrorResult {
  /** Safe message for the client — no SDK internals. */
  readonly userMessage: string;
  /** Whether the caller should retry after a delay. */
  readonly retryable: boolean;
  /** HTTP status code if available, undefined for non-HTTP errors. */
  readonly status: number | undefined;
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  429: 'The AI service is busy right now (rate limit reached). Please wait a moment and try again.',
  503: 'The AI service is temporarily overloaded. Please try again in a few seconds.',
  400: 'Your request could not be processed by the AI model. Try adjusting the email context or length.',
  401: 'AI service configuration error. Please contact support.',
  403: 'AI service access denied. Please contact support.',
  500: 'The AI service encountered an internal error. Please try again.',
};

const RETRYABLE_STATUSES = new Set([429, 503]);

/**
 * Classifies a raw error thrown by the Gemini SDK into a safe GeminiErrorResult.
 * Never surfaces raw API messages to the caller.
 */
export function classifyGeminiError(err: unknown): GeminiErrorResult {
  if (err instanceof GoogleGenerativeAIFetchError) {
    console.error('[Gemini Raw Error]:', err.message, err.status, err.statusText);
    const status = err.status;
    const userMessage =
      (typeof status === 'number' ? STATUS_MESSAGES[status] : undefined) ??
      `The AI service returned an unexpected error${typeof status === 'number' ? ` (HTTP ${status})` : ''}. Please try again.`;

    return {
      userMessage,
      retryable: typeof status === 'number' && RETRYABLE_STATUSES.has(status),
      status,
    };
  }

  if (err instanceof Error) {
    // Non-HTTP SDK errors (parse failures, response shape mismatch, etc.)
    // Log internally (server console) but return a generic client message.
    console.error('[Gemini] Non-HTTP error:', err.message);
    return {
      userMessage: 'The AI returned an unexpected response. Please try again.',
      retryable: false,
      status: undefined,
    };
  }

  return {
    userMessage: 'An unknown error occurred. Please try again.',
    retryable: false,
    status: undefined,
  };
}
