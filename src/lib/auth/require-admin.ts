import 'server-only';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Server-side admin guard. Returns the signed-in admin or redirects to the
 * login page. Use at the top of every admin Server Component and inside every
 * admin Server Action — never trust the client.
 *
 * Two checks, both required:
 *   1. There is an authenticated Supabase session (getUser validates the JWT
 *      against the auth server, not just the cookie).
 *   2. That user is allow-listed in public.admins (verified via the is_admin()
 *      RLS function, which is also the DB-level backstop on every write).
 *
 * Redirects to /admin/login when either check fails, so admin pages can call
 * this unconditionally and assume an admin from that point on.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    // Supabase not configured — there is no way to be an admin. Send to login,
    // which renders the "not configured" state.
    redirect('/admin/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: isAdmin, error } = await supabase.rpc('is_admin');

  if (error || !isAdmin) {
    redirect('/admin/login?denied=1');
  }

  return { id: user.id, email: user.email ?? '' };
}

/**
 * Non-redirecting variant for places that need to branch on admin status
 * (e.g. the login page deciding whether to bounce an already-signed-in admin
 * straight to the dashboard). Returns the admin or null.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || !isAdmin) return null;

  return { id: user.id, email: user.email ?? '' };
}
