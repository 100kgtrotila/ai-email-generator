'use server';

/**
 * Email Server Actions — secured with Firebase ID token verification.
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { adminAuth } from '@/lib/firebase/admin';
import { GeminiServiceError } from '@/lib/gemini/service';
import { getAIService } from '@/lib/ai/factory';
import { logError, logInfo } from '@/lib/logger';
import {
  saveEmail,
  getEmails,
  deleteEmail,
  toGeneratedEmail,
  type EmailDocument,
} from '@/lib/firebase/email-repository';
import { generatedEmailSchema, emailRequestSchema } from '@/lib/validations/email';
import { z } from 'zod';
import type { ActionResult, EmailRequest, GeneratedEmail, ErrorCategory } from '@/types';

// ──────────────────────────────────────────────────────────────────────────────
// Auth guard — shared by all actions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies a Firebase ID token and returns the authoritative UID.
 * Throws if the token is invalid, expired, or revoked.
 */
async function verifyIdToken(idToken: string): Promise<string> {
  const decoded = await adminAuth.verifyIdToken(idToken, /* checkRevoked */ true);
  return decoded.uid;
}

// ──────────────────────────────────────────────────────────────────────────────
// Generate
// ──────────────────────────────────────────────────────────────────────────────

export async function generateEmailAction(
  idToken: string,
  request: EmailRequest,
): Promise<ActionResult<GeneratedEmail & { retryable?: boolean }>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch (err) {
    logError('Auth verification failed', err, { action: 'generateEmailAction', category: 'AUTH_TOKEN_INVALID' });
    return { success: false, error: { category: 'AUTH_TOKEN_INVALID', message: 'Unauthorized.', retryable: false } };
  }

  logInfo(`uid=${uid}`, { action: 'generateEmailAction', uid });

  const parseResult = emailRequestSchema.safeParse(request);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .flatMap(([field, errs]) => (errs ?? []).map((msg) => `${field}: ${msg}`))
      .join(' | ');
    logError('Validation failed', new Error(messages), { action: 'generateEmailAction', uid, category: 'VALIDATION_ERROR' });
    return {
      success: false,
      error: { category: 'VALIDATION_ERROR', message: messages || 'Invalid email request data.', retryable: false },
    };
  }

  try {
    const result = await getAIService().generateEmail(parseResult.data);
    const email: GeneratedEmail = {
      id: randomUUID(),
      subject: result.subject,
      body: result.body,
      request,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: email };
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      // Use the status or existing reclassification to map to category
      let category: ErrorCategory = 'UNKNOWN';
      if (err.status === 429) category = 'GEMINI_RATE_LIMIT';
      else if (err.userMessage.includes('format') || err.userMessage.includes('parse')) category = 'GEMINI_INVALID_RESPONSE';
      
      logError('Gemini Service Error', err, { action: 'generateEmailAction', uid, category });
      return {
        success: false,
        error: { category, message: err.userMessage, retryable: err.retryable },
      };
    }
    const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
    logError('Unexpected error during generation', err, { action: 'generateEmailAction', uid, category: 'UNKNOWN' });
    return { success: false, error: { category: 'UNKNOWN', message, retryable: true } };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Save
// ──────────────────────────────────────────────────────────────────────────────

export async function saveEmailAction(
  idToken: string,
  email: GeneratedEmail,
): Promise<ActionResult<void>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch (err) {
    logError('Auth verification failed', err, { action: 'saveEmailAction', category: 'AUTH_TOKEN_INVALID' });
    return { success: false, error: { category: 'AUTH_TOKEN_INVALID', message: 'Unauthorized.', retryable: false } };
  }

  const parseResult = generatedEmailSchema.safeParse(email);
  if (!parseResult.success) {
    logError('Validation failed', parseResult.error, { action: 'saveEmailAction', uid, category: 'VALIDATION_ERROR' });
    return { success: false, error: { category: 'VALIDATION_ERROR', message: 'Invalid email data.', retryable: false } };
  }
  const validEmail = parseResult.data;

  try {
    const doc: EmailDocument = {
      id: validEmail.id,
      subject: validEmail.subject,
      body: validEmail.body,
      request: validEmail.request,
      createdAt: validEmail.createdAt.toISOString(),
      uid,
    };
    await saveEmail(uid, doc);
    revalidatePath('/history');
    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error while saving.';
    logError('Error saving email', err, { action: 'saveEmailAction', uid, category: 'FIRESTORE_READ_WRITE' });
    return { success: false, error: { category: 'FIRESTORE_READ_WRITE', message, retryable: true } };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// History
// ──────────────────────────────────────────────────────────────────────────────

export async function getEmailHistoryAction(
  idToken: string,
): Promise<ActionResult<GeneratedEmail[]>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch (err) {
    logError('Auth verification failed', err, { action: 'getEmailHistoryAction', category: 'AUTH_TOKEN_INVALID' });
    return { success: false, error: { category: 'AUTH_TOKEN_INVALID', message: 'Unauthorized.', retryable: false } };
  }

  try {
    const docs = await getEmails(uid);
    return { success: true, data: docs.map(toGeneratedEmail) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching history.';
    logError('Error fetching history', err, { action: 'getEmailHistoryAction', uid, category: 'FIRESTORE_READ_WRITE' });
    return { success: false, error: { category: 'FIRESTORE_READ_WRITE', message, retryable: true } };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Delete
// ──────────────────────────────────────────────────────────────────────────────

export async function deleteEmailAction(
  idToken: string,
  emailId: string,
): Promise<ActionResult<void>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch (err) {
    logError('Auth verification failed', err, { action: 'deleteEmailAction', category: 'AUTH_TOKEN_INVALID' });
    return { success: false, error: { category: 'AUTH_TOKEN_INVALID', message: 'Unauthorized.', retryable: false } };
  }

  const parseResult = z.string().uuid('Invalid email ID format.').safeParse(emailId);
  if (!parseResult.success) {
    logError('Validation failed', parseResult.error, { action: 'deleteEmailAction', uid, category: 'VALIDATION_ERROR' });
    return { success: false, error: { category: 'VALIDATION_ERROR', message: 'Invalid email ID.', retryable: false } };
  }
  const validEmailId = parseResult.data;

  try {
    await deleteEmail(uid, validEmailId);
    revalidatePath('/history');
    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error while deleting.';
    logError('Error deleting email', err, { action: 'deleteEmailAction', uid, category: 'FIRESTORE_READ_WRITE' });
    return { success: false, error: { category: 'FIRESTORE_READ_WRITE', message, retryable: true } };
  }
}
