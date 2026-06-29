/**
 * Email Firestore repository.
 *
 * SERVER ONLY — all functions execute on the server via Server Actions.
 * Firestore SDK calls are intentionally isolated here so that Server Actions
 * remain thin orchestrators.
 *
 * Patterns enforced (Firebase Agent spec):
 *   - COLLECTIONS constants — no inline string literals
 *   - FirestoreDataConverter<EmailDocument> — fully typed reads & writes
 *   - Explicit null returns — getEmailById returns EmailDocument | null
 *   - Typed domain document — EmailDocument is the Firestore-layer type;
 *     Server Actions map it to/from the UI-layer GeneratedEmail type
 *
 * Collection path: users/{uid}/emails/{emailId}
 */
import 'server-only';

import type { FirestoreDataConverter, QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { adminDb } from './admin';
import { COLLECTIONS } from './collections';
import type { EmailRequest, EmailTone } from '@/types';

// ──────────────────────────────────────────────────────────────────────────────
// Domain document type (Firestore layer)
// Kept separate from the UI-layer GeneratedEmail so that each layer can evolve
// independently. EmailDocument is what is literally stored in Firestore.
// ──────────────────────────────────────────────────────────────────────────────

export interface EmailRequestDocument {
  readonly recipientName: string;
  readonly recipientRole: string;
  readonly senderName: string;
  readonly purpose: string;
  readonly tone: EmailTone;
  readonly additionalContext: string;
}

export interface EmailDocument {
  /** Firestore document ID — populated from snapshot.id on reads. */
  readonly id: string;
  readonly subject: string;
  readonly body: string;
  readonly request: EmailRequestDocument;
  /** ISO 8601 timestamp string. */
  readonly createdAt: string;
  /** UID of the owning user — denormalized for potential collection-group queries. */
  readonly uid: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Firestore Data Converter
// Enforces that every read/write through this converter is fully typed.
// The converter strips the `id` field on writes (it lives in the document path)
// and re-attaches it on reads (from snapshot.id).
// ──────────────────────────────────────────────────────────────────────────────

export const emailConverter: FirestoreDataConverter<EmailDocument> = {
  toFirestore(email: EmailDocument): DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = email;
    return rest;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot): EmailDocument {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      subject: data.subject as string,
      body: data.body as string,
      request: data.request as EmailRequestDocument,
      createdAt: data.createdAt as string,
      uid: data.uid as string,
    };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Typed collection reference helper
// Using withConverter() once here means every query in this file is fully typed.
// ──────────────────────────────────────────────────────────────────────────────

const emailsRef = (uid: string) =>
  adminDb
    .collection(COLLECTIONS.USERS)
    .doc(uid)
    .collection(COLLECTIONS.EMAILS)
    .withConverter(emailConverter);

// ──────────────────────────────────────────────────────────────────────────────
// Repository methods
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Persist a new email document. The converter strips `id` from the payload
 * since it is encoded in the document path.
 */
export async function saveEmail(
  uid: string,
  email: Omit<EmailDocument, 'id'> & { readonly id: string },
): Promise<void> {
  await emailsRef(uid).doc(email.id).set(email);
}

/**
 * Retrieve all emails for a user, ordered by creation date descending.
 * Returns an empty array if the user has no saved emails.
 */
export async function getEmails(uid: string): Promise<EmailDocument[]> {
  const snapshot = await emailsRef(uid).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => doc.data());
}

/**
 * Retrieve a single email by ID.
 * Returns null if the document does not exist — explicit null per Agent spec.
 */
export async function getEmailById(
  uid: string,
  emailId: string,
): Promise<EmailDocument | null> {
  const snapshot = await emailsRef(uid).doc(emailId).get();
  return snapshot.exists ? snapshot.data() ?? null : null;
}

/**
 * Hard-delete a single email document.
 */
export async function deleteEmail(
  uid: string,
  emailId: string,
): Promise<void> {
  await emailsRef(uid).doc(emailId).delete();
}

// ──────────────────────────────────────────────────────────────────────────────
// Type mapper helpers (Firestore ↔ UI layer)
// Kept here so the mapping logic lives next to the Firestore type definition.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Map an EmailDocument (Firestore layer) to the UI-layer GeneratedEmail shape.
 * The only structural difference is the omission of the denormalized `uid` field.
 */
export function toGeneratedEmail(doc: EmailDocument): {
  id: string;
  subject: string;
  body: string;
  request: EmailRequest;
  createdAt: string;
} {
  return {
    id: doc.id,
    subject: doc.subject,
    body: doc.body,
    request: doc.request,
    createdAt: doc.createdAt,
  };
}
