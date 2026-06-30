import 'server-only';

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { buildSystemInstruction, buildEmailUserPrompt } from './prompts';
import { classifyGeminiError } from './errors';
import type { EmailRequest } from '@/types';

const MODEL_ID = 'gemini-2.5-flash' as const;

const GENERATION_CONFIG = {
  responseMimeType: 'application/json',
  temperature: 0.7,
  maxOutputTokens: 1024,
  topP: 0.9,
} as const;

export interface GeminiEmailResult {
  readonly subject: string;
  readonly body: string;
}

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

function parseEmailResponse(raw: string, request: EmailRequest): GeminiEmailResult {
  let sanitized = raw;
  // Robust extraction: Gemini occasionally wraps the response in markdown blocks 
  // (e.g., ```json ... ```) even when responseMimeType is set to application/json.
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    sanitized = jsonMatch[0];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitized);
  } catch (e) {
    console.error('\n❌ [Gemini Parse Error] ❌');
    console.error('Payload:', { tone: request.tone, length: request.length, purpose: request.purpose });
    console.error('Raw String:', raw);
    console.error('Error:', e instanceof Error ? e.message : String(e));
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

  if (typed.subject.trim().length === 0 || typed.body.trim().length === 0) {
    throw new GeminiServiceError({
      userMessage: 'The AI generated an empty response. Please try again.',
      retryable: true,
      status: undefined,
    });
  }

  return { subject: typed.subject.trim(), body: typed.body.trim() };
}

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
    console.error('\n❌ [Gemini API Error] ❌');
    console.error('Payload:', { tone: request.tone, length: request.length, purpose: request.purpose });
    console.error('Error Details:', err);
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
      throw new GeminiServiceError({
        userMessage: 'AI Service quota exceeded. Please wait a minute before trying again.',
        retryable: true,
        status: 429,
      });
    }
    const classified = classifyGeminiError(err);
    throw new GeminiServiceError(classified);
  }
  return parseEmailResponse(rawText, request);
}
