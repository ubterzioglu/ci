import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ADMIN_COOKIE } from '@/lib/auth/admin-session';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

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

  // 1. Legacy-slug redirects take precedence.
  const match = REDIRECTS[path];
  if (match) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = match.destination;
    return NextResponse.redirect(redirectUrl, match.status);
  }

  // 2. Gate the admin area. The login page is public; every other /admin path
  //    requires a valid admin session cookie. The cookie's HMAC is verified
  //    server-side by requireAdmin() on each page/action — here we only check
  //    for its presence so unauthenticated visitors are bounced to login.
  const isAdminPath = path.startsWith('/admin');
  const isLoginPath = path === '/admin/login';

  if (isAdminPath && !isLoginPath) {
    const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!hasCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Resolve the locale from the path's first segment ("unprefixed default":
  //    `/` = tr, `/en/…`, `/de/…`) and expose it on the `x-locale` request
  //    header so the root layout can render the correct <html lang> without a
  //    [lang] segment of its own. No redirect — Turkish URLs stay bare.
  const firstSegment = path.split('/')[1] ?? '';
  const locale = isLocale(firstSegment) ? firstSegment : defaultLocale;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on page-like paths and the admin area; skip static assets and API
  // routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/).*)'],
};
