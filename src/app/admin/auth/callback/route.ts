import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * OAuth callback for admin sign-in (e.g. Google). Supabase redirects here with
 * a `code` after the provider authenticates the user. We exchange it for a
 * session, then enforce the admin allowlist: a valid Google account that is NOT
 * in public.admins is signed back out and bounced to the login page with a
 * clear message, so the panel stays closed to non-admins.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error');

  const loginUrl = new URL('/admin/login', origin);

  if (oauthError) {
    loginUrl.searchParams.set('denied', 'oauth');
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set('denied', 'oauth');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    loginUrl.searchParams.set('denied', 'config');
    return NextResponse.redirect(loginUrl);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    loginUrl.searchParams.set('denied', 'oauth');
    return NextResponse.redirect(loginUrl);
  }

  // Enforce the admin allowlist.
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    await supabase.auth.signOut();
    loginUrl.searchParams.set('denied', '1');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL('/admin', origin));
}
