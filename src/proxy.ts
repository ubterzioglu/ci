import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Legacy-slug redirects.
 *
 * These mirror rows in the `redirects` table and the old Wix URL structure.
 * Kept as a static edge map so there is no database round-trip on every
 * request. When the redirect set grows, regenerate this map from the
 * `redirects` table (e.g. a small build step) rather than querying per-request.
 *
 * The primary /about-1 → /about redirect is also declared in next.config.ts;
 * this map covers any additional Wix paths.
 */
const REDIRECTS: Record<string, { destination: string; status: number }> = {
  '/about-1': { destination: '/about', status: 301 },
  '/reservations-1': { destination: '/reservations', status: 301 },
  '/home': { destination: '/', status: 301 },
};

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const match = REDIRECTS[path];

  if (match) {
    const url = request.nextUrl.clone();
    url.pathname = match.destination;
    return NextResponse.redirect(url, match.status);
  }

  return NextResponse.next();
}

export const config = {
  // Run only on page-like paths; skip static assets and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/).*)'],
};
