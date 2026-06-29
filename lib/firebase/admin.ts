/**
 * Firebase Admin SDK singleton.
 *
 * SERVER ONLY — guarded by `server-only` import.
 * Any attempt to import this module from a Client Component will throw a
 * build-time error with a clear message.
 *
 * Uses the firebase-admin v12+ modular API (named exports from sub-packages).
 *
 * @delegate Firebase Agent — business-level Firestore queries belong in
 * email-repository.ts; this file only manages SDK initialization.
 */
import 'server-only';

import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[Firebase Admin] Missing required environment variables: ' +
        'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY',
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminApp: App = getAdminApp();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
