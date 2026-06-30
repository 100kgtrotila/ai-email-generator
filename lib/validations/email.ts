/**
 * Shared Zod schemas for email generation.
 *
 * IMPORTANT: This file is imported by BOTH the Client Component (dashboard)
 * and the Server Action. Keep it free of server-only or client-only imports.
 *
 * The `emailGenerationSchema` is the definitive source of truth for the
 * Generator form. It is intentionally separate from `emailRequestSchema`
 * (the full EmailRequest domain model) to avoid leaking internal fields
 * (senderName, recipientName, etc.) to the client form contract.
 */

import { z } from 'zod';
import type { EmailTone, EmailLength } from '@/types';

// ─── Tone / Length enums ───────────────────────────────────────────────────────

const TONES: [EmailTone, ...EmailTone[]] = [
  'professional',
  'friendly',
  'formal',
  'casual',
  'persuasive',
];

const LENGTHS: [EmailLength, ...EmailLength[]] = ['short', 'medium', 'long'];

// ─── Keyboard-smash guard ──────────────────────────────────────────────────────

/**
 * Returns true if the string contains any single "word" (sequence of
 * non-whitespace characters) longer than 20 characters, which is a reliable
 * heuristic for keyboard mashing (e.g. "ewqtwwqetqwetwetw").
 * Legitimate words — URLs, compound terms — rarely exceed this threshold
 * without a space, and the user can always add context naturally.
 */
function hasKeyboardSmash(value: string): boolean {
  return value.split(/\s+/).some((word) => word.length > 20);
}

// ─── Generator form schema (frontend + backend guard) ─────────────────────────

/**
 * The schema used by:
 *   - react-hook-form zodResolver on the dashboard page (frontend validation)
 *   - generateEmailAction safeParse before calling Gemini (backend guard)
 *
 * Field contract:
 *   subject  — required, 5–200 chars, no keyboard smash
 *   tone     — one of the 5 exact EmailTone values
 *   length   — one of the 3 EmailLength values
 *   context  — optional; when provided, must be ≥ 10 chars and no keyboard smash
 */
export const emailGenerationSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters.')
    .max(200, 'Subject must be 200 characters or fewer.')
    .refine((v) => !hasKeyboardSmash(v), {
      message: 'Subject appears to contain gibberish. Please describe the email topic clearly.',
    }),

  tone: z.enum(TONES, {
    message: 'Please select a valid tone.',
  }),

  length: z.enum(LENGTHS, {
    message: 'Please select a valid length.',
  }),

  context: z
    .string()
    .max(2000, 'Context must be 2000 characters or fewer.')
    .refine(
      (v) => v.trim().length === 0 || v.trim().length >= 10,
      { message: 'Context must be at least 10 characters when provided.' },
    )
    .refine(
      (v) => !hasKeyboardSmash(v),
      { message: 'Context appears to contain gibberish. Please provide meaningful context.' },
    ),
});

/** Inferred TypeScript type for the validated generator form data. */
export type EmailGenerationInput = z.infer<typeof emailGenerationSchema>;

// ─── Full EmailRequest domain schema (used internally by repository / actions) ─

/**
 * Validates a full EmailRequest — used server-side only for repository writes.
 * Separate from emailGenerationSchema so UI contract changes don't touch storage.
 */
export const emailRequestSchema = z.object({
  recipientName: z.string().max(100).optional().default(''),
  recipientRole: z.string().max(100).optional().default(''),
  senderName: z.string().min(1, 'Sender name is required').max(100),
  purpose: z
    .string()
    .min(5, 'Purpose must be at least 5 characters')
    .max(1000)
    .refine((v) => !hasKeyboardSmash(v), {
      message: 'Purpose appears to contain gibberish.',
    }),
  tone: z.enum(TONES, {
    message: 'Invalid tone selected.',
  }),
  additionalContext: z.string().max(2000).optional().default(''),
  length: z.enum(LENGTHS).optional().default('medium'),
});

// ─── GeneratedEmail persistence schema ────────────────────────────────────────

export const generatedEmailSchema = z.object({
  id: z.uuid('Invalid email ID'),
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Body is required').max(10000),
  request: emailRequestSchema,
  createdAt: z.coerce.date({ message: 'Invalid date' }),
});
