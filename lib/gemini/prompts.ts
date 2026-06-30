/**
 * Gemini prompt builder functions.
 *
 * Pure functions — no SDK calls, no side effects. Each function accepts a
 * typed input and returns a string. This isolation makes prompts:
 *   - Unit-testable without mocking the Gemini SDK
 *   - Independently iterable by the Gemini Agent
 *   - Reusable across different generation strategies (standard vs. streaming)
 *
 * Two-part prompt architecture:
 *   buildSystemInstruction() — stable model persona & output contract (system turn)
 *   buildEmailUserPrompt()   — dynamic per-request context (user turn)
 *
 * The system instruction is set once on the model config, keeping the user
 * prompt lean and focused on request-specific variables only.
 */
import type { EmailRequest } from '@/types';

// ──────────────────────────────────────────────────────────────────────────────
// Tone vocabulary
// ──────────────────────────────────────────────────────────────────────────────

const TONE_INSTRUCTIONS: Readonly<Record<EmailRequest['tone'], string>> = {
  professional:
    'Professional and polished — clear, structured, and free of slang.',
  friendly:
    'Warm and approachable — personable while remaining respectful.',
  formal:
    'Highly formal — use full titles, avoid contractions, follow strict business etiquette.',
  casual:
    'Relaxed and conversational — as if writing to a trusted colleague.',
  persuasive:
    'Confident and compelling — lead with value, end with a clear call to action.',
};

// ──────────────────────────────────────────────────────────────────────────────
// System instruction (set once on the model, not per request)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Builds the system instruction that defines the model's persona and the
 * invariant output contract (JSON schema). Set this as `systemInstruction`
 * on the GenerativeModel config — it persists across all user turns.
 */
export function buildSystemInstruction(): string {
  return `You are an expert professional email writer with decades of experience \
crafting clear, effective, and contextually appropriate business communication.

You MUST return a valid JSON object with exactly two keys: 'subject' (the email subject) and 'body' (the email body). Do not include any markdown fences, conversational text, or explanations.

Rules you MUST follow:
- Never include markdown formatting, code fences, or any text outside the JSON object.
- The body must always begin with an appropriate greeting and end with a closing line.
- Match the requested tone precisely throughout the entire email.
- Do not invent facts, companies, or credentials not provided in the request.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// User-turn prompt (dynamic, per-request)
// ──────────────────────────────────────────────────────────────────────────────

const LENGTH_INSTRUCTIONS: Readonly<Record<NonNullable<EmailRequest['length']>, string>> = {
  short: 'Short — 1 to 2 concise paragraphs.',
  medium: 'Medium — 2 to 3 focused paragraphs.',
  long: 'Long — 3 to 5 detailed, well-structured paragraphs.',
};

/**
 * Builds the user-turn prompt from a typed EmailRequest.
 * This is intentionally concise — the system instruction handles the
 * persona and output format contract.
 */
export function buildEmailUserPrompt(request: EmailRequest): string {
  const toneDescription = TONE_INSTRUCTIONS[request.tone];
  const lengthDescription = LENGTH_INSTRUCTIONS[request.length ?? 'medium'];

  const recipientLine =
    request.recipientName && request.recipientRole
      ? `${request.recipientName} (${request.recipientRole})`
      : request.recipientName || request.recipientRole || 'the recipient';

  const lines: string[] = [
    `Write an email with the following specifications:`,
    ``,
    `Tone:           ${toneDescription}`,
    `Length:         ${lengthDescription}`,
    `From:           ${request.senderName}`,
    `To:             ${recipientLine}`,
    `Purpose:        ${request.purpose}`,
  ];

  if (request.additionalContext.trim().length > 0) {
    lines.push(`Additional context: ${request.additionalContext}`);
  }

  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy alias — kept for backward compatibility with service.ts during migration
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use buildEmailUserPrompt() + buildSystemInstruction() separately.
 * The system instruction should be set on the model config, not concatenated here.
 */
export function buildEmailPrompt(request: EmailRequest): string {
  return buildEmailUserPrompt(request);
}
