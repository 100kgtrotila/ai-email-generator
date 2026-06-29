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

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Firebase Client] Missing required env var: ${key}`);
  }
  return value;
}

let _app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (_app !== undefined) return _app;

  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  _app = initializeApp({
    apiKey: requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  });

  return _app;
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
