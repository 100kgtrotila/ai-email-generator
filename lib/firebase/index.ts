export { getFirebaseApp, getFirebaseAuth } from './client';
export { adminApp, adminDb, adminAuth } from './admin';
export { COLLECTIONS } from './collections';
export type { CollectionName } from './collections';
export {
  emailConverter,
  saveEmail,
  getEmails,
  getEmailById,
  deleteEmail,
  toGeneratedEmail,
} from './email-repository';
export type { EmailDocument, EmailRequestDocument } from './email-repository';
