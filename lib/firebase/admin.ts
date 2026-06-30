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
import { logError, logInfo } from '@/lib/logger';

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ?.replace(/^["']|["']$/g, '') // Remove accidental surrounding quotes
    .replace(/\\n/g, '\n');       // Convert literal \n strings to actual newlines

  if (!projectId || !clientEmail || !privateKey) {
    const errorMsg = '[Firebase Admin] Missing required environment variables: ' +
        'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY';
    logError(errorMsg, new Error('Missing Env Vars'), { action: 'initAdminApp', category: 'FIREBASE_ADMIN_INIT' });
    throw new Error(errorMsg);
  }

  try {
    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    logInfo('Firebase Admin initialized successfully', { action: 'initAdminApp' });
    return app;
  } catch (err) {
    const errorMsg = '[Firebase Admin] Failed to initialize admin app. Check if FIREBASE_ADMIN_PRIVATE_KEY is formatted correctly.';
    logError(errorMsg, err, { action: 'initAdminApp', category: 'FIREBASE_ADMIN_INIT' });
    throw new Error(errorMsg);
  }
}

export const adminApp = new Proxy({} as App, {
  get: (_target, prop) => (getAdminApp() as unknown as Record<string | symbol, unknown>)[prop],
});

export const adminDb = new Proxy({} as Firestore, {
  get: (_target, prop) => (getFirestore(getAdminApp()) as unknown as Record<string | symbol, unknown>)[prop],
});

export const adminAuth = new Proxy({} as Auth, {
  get: (_target, prop) => (getAuth(getAdminApp()) as unknown as Record<string | symbol, unknown>)[prop],
});
