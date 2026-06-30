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
 * Discriminated union returned by all Server Actions.
 * Actions NEVER throw to the client; they always return ActionResult<T>.
 */
export type ActionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };
