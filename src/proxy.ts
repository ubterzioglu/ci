import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

/**
 * Refreshes the Supabase auth session (when configured) and guards `/admin`.
 *
 * Cookie bridge follows the @supabase/ssr middleware pattern: cookies set by
 * Supabase during token refresh are written to BOTH the request (so any later
 * read in this same pass sees them) and the response (so the browser persists
 * them). Returns the response to use, plus whether a user is signed in.
 */
async function withAuth(
  request: NextRequest,
): Promise<{ response: NextResponse; hasUser: boolean }> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured — no session to refresh; treat as signed out.
  if (!url || !anonKey) {
    return { response, hasUser: false };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() must run so the session token is refreshed and the
  // refreshed cookies land on the response.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, hasUser: !!user };
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Legacy-slug redirects take precedence (cheap, no session work needed).
  const match = REDIRECTS[path];
  if (match) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = match.destination;
    return NextResponse.redirect(redirectUrl, match.status);
  }

  // 2. Refresh the auth session and gate /admin.
  const isAdminPath = path.startsWith('/admin');
  // The login page and the OAuth callback must be reachable WITHOUT a session:
  // the visitor has not signed in yet (callback is where the session is minted
  // from the provider's `?code=`).
  const isPublicAdminPath = path === '/admin/login' || path === '/admin/auth/callback';

  // Only the admin area needs session work; public pages skip it entirely.
  if (!isAdminPath) {
    return NextResponse.next();
  }

  const { response, hasUser } = await withAuth(request);

  // Unauthenticated visitors to any /admin page (except the login page and the
  // OAuth callback) are bounced to login. Authorization (is_admin) is enforced
  // server-side by requireAdmin(); the middleware only checks for a session.
  if (!hasUser && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on page-like paths and the admin area; skip static assets and API
  // routes. The negative lookahead keeps the public site cheap while still
  // matching `/admin/*` for session refresh + gating.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/).*)'],
};
