'use server';

/**
 * Email Server Actions — secured with Firebase ID token verification.
 *
 * Security model:
 *   Every exported action accepts an `idToken: string` from the client.
 *   The token is verified server-side via adminAuth.verifyIdToken() to produce
 *   the authoritative `uid`. The client-supplied UID is never trusted.
 *
 *   Client Component:
 *     const token = await getFirebaseAuth().currentUser?.getIdToken()
 *     await generateEmailAction(token, request)
 *
 * Error model:
 *   All actions return ActionResult<T> — never throw to the client.
 *   GeminiServiceError.userMessage is safe to surface; raw SDK errors are not.
 *   Auth failures always return { success: false, error: 'Unauthorized.' }
 *   with no further detail (avoids information leakage).
 *
 * Orchestration:
 *   Client → Action (auth + orchestration) → Service/Repository → SDK
 *
 * @delegate Gemini Agent   — generateEmail() in lib/gemini/service.ts
 * @delegate Firebase Agent — repository methods in lib/firebase/email-repository.ts
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { adminAuth } from '@/lib/firebase/admin';
import { GeminiServiceError } from '@/lib/gemini/service';
import { getAIService } from '@/lib/ai/factory';
import {
  saveEmail,
  getEmails,
  deleteEmail,
  toGeneratedEmail,
  type EmailDocument,
} from '@/lib/firebase/email-repository';
import { generatedEmailSchema, emailRequestSchema } from '@/lib/validations/email';
import { z } from 'zod';
import type { ActionResult, EmailRequest, GeneratedEmail } from '@/types';

// ──────────────────────────────────────────────────────────────────────────────
// Auth guard — shared by all actions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies a Firebase ID token and returns the authoritative UID.
 * Throws a generic 'Unauthorized.' error (no detail) if the token is invalid,
 * expired, or revoked — prevents token structure information leakage.
 */
async function verifyIdToken(idToken: string): Promise<string> {
  const decoded = await adminAuth.verifyIdToken(idToken, /* checkRevoked */ true);
  return decoded.uid;
}

// ──────────────────────────────────────────────────────────────────────────────
// Generate
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the caller, then calls Gemini to generate an email.
 * Returns the generated content as a UI-layer GeneratedEmail.
 * Does NOT auto-save — the user decides whether to persist it.
 *
 * Error classification:
 *   GeminiServiceError  → user-safe message + retryable flag forwarded
 *   Auth error          → generic 'Unauthorized.' (no SDK detail)
 *   Other               → generic server error message
 */
export async function generateEmailAction(
  idToken: string,
  request: EmailRequest,
): Promise<ActionResult<GeneratedEmail & { retryable?: boolean }>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch {
    return { success: false, error: 'Unauthorized.' };
  }

  // uid is verified — log it server-side for audit trail
  console.info(`[generateEmailAction] uid=${uid}`);

  // Validate the full request schema to ensure no prompt injection or data bloat occurs
  // in unvalidated fields like senderName.
  const parseResult = emailRequestSchema.safeParse(request);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    // Build a human-readable message listing every failing field.
    const messages = Object.entries(fieldErrors)
      .flatMap(([field, errs]) =>
        (errs ?? []).map((msg) => `${field}: ${msg}`),
      )
      .join(' | ');
    return {
      success: false,
      error: messages || 'Invalid email request data.',
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
      return {
        success: false,
        error: err.userMessage,
      };
    }
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
    return { success: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Save
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the caller, then persists a generated email to Firestore.
 * The Firestore document includes the denormalized `uid` for collection-group
 * query readiness.
 */
export async function saveEmailAction(
  idToken: string,
  email: GeneratedEmail,
): Promise<ActionResult<void>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch {
    return { success: false, error: 'Unauthorized.' };
  }

  const parseResult = generatedEmailSchema.safeParse(email);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid email data.' };
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
    const message =
      err instanceof Error ? err.message : 'Unknown error while saving.';
    return { success: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// History
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the caller, then fetches their full email generation history.
 * Maps EmailDocument[] (Firestore layer) → GeneratedEmail[] (UI layer).
 */
export async function getEmailHistoryAction(
  idToken: string,
): Promise<ActionResult<GeneratedEmail[]>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const docs = await getEmails(uid);
    return { success: true, data: docs.map(toGeneratedEmail) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error fetching history.';
    return { success: false, error: message };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Delete
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the caller, then hard-deletes a single email from Firestore.
 * The `uid` from the verified token ensures users can only delete their own emails.
 */
export async function deleteEmailAction(
  idToken: string,
  emailId: string,
): Promise<ActionResult<void>> {
  let uid: string;

  try {
    uid = await verifyIdToken(idToken);
  } catch {
    return { success: false, error: 'Unauthorized.' };
  }

  const parseResult = z.string().uuid('Invalid email ID format.').safeParse(emailId);
  if (!parseResult.success) {
    return { success: false, error: 'Invalid email ID.' };
  }
  const validEmailId = parseResult.data;

  try {
    await deleteEmail(uid, validEmailId);
    revalidatePath('/history');
    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown error while deleting.';
    return { success: false, error: message };
  }
}
