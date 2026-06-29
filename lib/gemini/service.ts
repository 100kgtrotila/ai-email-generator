/**
 * Gemini generation service.
 *
 * SERVER ONLY — GEMINI_API_KEY must never reach the client bundle.
 * This is the single file in the codebase that calls the @google/generative-ai SDK.
 *
 * Design decisions:
 *   - Lazy client init: `GoogleGenerativeAI` is instantiated on first call,
 *     not at module evaluation time, so missing env vars crash fast at runtime
 *     with a clear message rather than silently during prerender.
 *   - systemInstruction set on the model config (not in the user prompt)
 *     so the persona + JSON schema contract is stable across all requests.
 *   - `responseMimeType: 'application/json'` enforces structured JSON output
 *     even if the model attempts to add markdown fences.
 *   - All SDK errors are classified via classifyGeminiError() — raw error
 *     messages never surface beyond this file.
 */
import 'server-only';

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { buildSystemInstruction, buildEmailUserPrompt } from './prompts';
import { classifyGeminiError } from './errors';
import type { EmailRequest } from '@/types';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const MODEL_ID = 'gemini-1.5-flash' as const;

const GENERATION_CONFIG = {
  responseMimeType: 'application/json',
  temperature: 0.7,
  maxOutputTokens: 1024,
  topP: 0.9,
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Public result type
// ──────────────────────────────────────────────────────────────────────────────

export interface GeminiEmailResult {
  readonly subject: string;
  readonly body: string;
}

/**
 * Structured error returned when Gemini generation fails.
 * Thrown as a typed class so callers can distinguish Gemini errors from
 * other operational errors in the Server Action catch block.
 */
export class GeminiServiceError extends Error {
  readonly userMessage: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(result: { userMessage: string; retryable: boolean; status: number | undefined }) {
    super(result.userMessage);
    this.name = 'GeminiServiceError';
    this.userMessage = result.userMessage;
    this.retryable = result.retryable;
    this.status = result.status;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Lazy client & model — initialized on first call, not at module eval time
// ──────────────────────────────────────────────────────────────────────────────

let _model: GenerativeModel | undefined;

function getModel(): GenerativeModel {
  if (_model !== undefined) return _model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      '[Gemini] Missing required environment variable: GEMINI_API_KEY',
    );
  }

  const client = new GoogleGenerativeAI(apiKey);
  _model = client.getGenerativeModel({
    model: MODEL_ID,
    systemInstruction: buildSystemInstruction(),
    generationConfig: GENERATION_CONFIG,
  });

  return _model;
}

// ──────────────────────────────────────────────────────────────────────────────
// Response validator — narrows `unknown` to GeminiEmailResult
// ──────────────────────────────────────────────────────────────────────────────

function parseEmailResponse(raw: string): GeminiEmailResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GeminiServiceError({
      userMessage: 'The AI returned a response that could not be parsed. Please try again.',
      retryable: true,
      status: undefined,
    });
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('subject' in parsed) ||
    !('body' in parsed) ||
    typeof (parsed as Record<string, unknown>).subject !== 'string' ||
    typeof (parsed as Record<string, unknown>).body !== 'string'
  ) {
    throw new GeminiServiceError({
      userMessage: 'The AI returned an unexpected response format. Please try again.',
      retryable: true,
      status: undefined,
    });
  }

  const typed = parsed as { subject: string; body: string };

  // Sanity-check non-empty values
  if (typed.subject.trim().length === 0 || typed.body.trim().length === 0) {
    throw new GeminiServiceError({
      userMessage: 'The AI generated an empty response. Please try again.',
      retryable: true,
      status: undefined,
    });
  }

  return { subject: typed.subject.trim(), body: typed.body.trim() };
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Generates an email subject and body from a typed EmailRequest.
 *
 * Throws `GeminiServiceError` on any failure — the message is always
 * safe to display to the user and never contains raw SDK internals.
 *
 * The caller (Server Action) wraps this in try/catch and maps
 * GeminiServiceError.userMessage into an ActionResult<T>.
 */
export async function generateEmail(
  request: EmailRequest,
): Promise<GeminiEmailResult> {
  const model = getModel();
  const userPrompt = buildEmailUserPrompt(request);

  let rawText: string;

  try {
    const result = await model.generateContent(userPrompt);
    rawText = result.response.text();
  } catch (err) {
    // Classify SDK / HTTP errors (429, 503, etc.) into safe user messages
    const classified = classifyGeminiError(err);
    throw new GeminiServiceError(classified);
  }

  // Parse and validate the structured JSON response
  return parseEmailResponse(rawText);
}
