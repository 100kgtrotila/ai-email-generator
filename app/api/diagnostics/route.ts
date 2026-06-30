export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Simple hardcoded or env-based token guard
  const expectedToken = process.env.DIAGNOSTICS_TOKEN || 'debug123';
  if (token !== expectedToken) {
    return Response.json({ ok: false, error: 'Unauthorized diagnostic access' }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  checks.firebaseAdminEnv = {
    ok: !!(
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ),
  };

  checks.firebaseClientEnv = {
    ok: !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ),
  };

  checks.aiProvider = {
    ok: true,
    detail: process.env.AI_PROVIDER ?? 'gemini (default)',
  };

  checks.geminiKey = {
    ok: process.env.AI_PROVIDER !== 'gemini' || !!process.env.GEMINI_API_KEY,
  };

  try {
    const { adminAuth } = await import('@/lib/firebase/admin');
    await adminAuth.listUsers(1); // lightweight query to verify initialization and auth
    checks.firebaseAdminConnection = { ok: true };
  } catch (e) {
    checks.firebaseAdminConnection = {
      ok: false,
      detail: e instanceof Error ? e.message : 'unknown',
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return Response.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 });
}
