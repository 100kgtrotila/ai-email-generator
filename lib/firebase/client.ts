/**
 * Firebase Client SDK singleton — lazy initialization.
 *
 * CLIENT-SIDE ONLY (guarded by `client-only`).
 *
 * Uses a lazy getter pattern so that the Firebase app is initialized only
 * when first accessed at runtime (not at module evaluation time during SSR /
 * static prerendering). This prevents "Missing env var" errors during
 * `next build` when NEXT_PUBLIC_ variables are absent in the build environment.
 */
import 'client-only';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let _app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (_app !== undefined) return _app;

  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error('[Firebase Client] Missing one or more required NEXT_PUBLIC_FIREBASE_* env vars.');
  }

  _app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });

  return _app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
