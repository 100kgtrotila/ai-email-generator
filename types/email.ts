/**
 * Email domain types.
 * Single source of truth for all email-related data shapes across Server Actions,
 * Firestore repositories, and UI components.
 */

export type EmailTone =
  | 'professional'
  | 'friendly'
  | 'formal'
  | 'casual'
  | 'persuasive';

/** Controls the target verbosity / paragraph count of the generated email. */
export type EmailLength = 'short' | 'medium' | 'long';

export interface EmailRequest {
  readonly recipientName: string;
  readonly recipientRole: string;
  readonly senderName: string;
  readonly purpose: string;
  readonly tone: EmailTone;
  readonly additionalContext: string;
  /** Optional length hint — defaults to 'medium' when omitted. */
  readonly length?: EmailLength;
}

export interface GeneratedEmail {
  readonly id: string;
  readonly subject: string;
  readonly body: string;
  readonly request: EmailRequest;
  readonly createdAt: string; // ISO 8601 — serializable across Server/Client boundary
}

/**
 * Error categories for granular diagnostic handling.
 */
export type ErrorCategory =
  | 'AUTH_TOKEN_INVALID'
  | 'FIREBASE_ADMIN_INIT'
  | 'FIREBASE_CLIENT_INIT'
  | 'FIRESTORE_READ_WRITE'
  | 'GEMINI_API_KEY_MISSING'
  | 'GEMINI_RATE_LIMIT'
  | 'GEMINI_INVALID_RESPONSE'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN';

/**
 * Discriminated union returned by all Server Actions.
 * Actions NEVER throw to the client; they always return ActionResult<T>.
 */
export type ActionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: { category: ErrorCategory; message: string; retryable: boolean } };
