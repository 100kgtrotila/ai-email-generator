/**
 * Firestore collection name constants.
 *
 * Never use inline string literals for collection names in repository code.
 * Import from here to get compile-time safety and a single place to rename.
 */
export const COLLECTIONS = {
  USERS: 'users',
  EMAILS: 'emails',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
