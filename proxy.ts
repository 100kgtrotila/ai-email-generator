import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for route protection.
 *
 * Runs on the Edge runtime before requests are completed.
 * It checks for the 'firebase-token' cookie which is synced by
 * the AuthProvider on the client.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('firebase-token')?.value;

  // If no token exists, the user is unauthenticated. Redirect to login.
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // You could also pass a ?redirect parameter here if desired
    return NextResponse.redirect(loginUrl);
  }

  // If the token exists, allow the request to proceed.
  // Note: We do not cryptographically verify the token here because
  // firebase-admin does not run on the Edge runtime. Complete validation
  // happens in the Server Actions using verifyIdToken().
  return NextResponse.next();
}

// Config specifies which routes this middleware applies to.
export const config = {
  matcher: ['/dashboard/:path*', '/history/:path*', '/profile/:path*'],
};
