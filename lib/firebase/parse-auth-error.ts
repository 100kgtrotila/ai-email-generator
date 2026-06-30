export function parseFirebaseAuthError(error: unknown): string {
  if (!(error instanceof Error)) return 'Authentication failed. Please try again.';
  const cleaned = error.message
    .replace('Firebase: ', '')
    .replace(/\(auth\/.*\)\.?/, '')
    .trim();
  return cleaned.length > 0 ? cleaned : 'Authentication failed. Please try again.';
}
