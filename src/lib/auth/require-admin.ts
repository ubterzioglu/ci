import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_COOKIE, verifySessionToken } from './admin-session';

/**
 * Server-side admin guard for the password-gated panel. Redirects to the login
 * page unless the request carries a valid signed admin session cookie. Call at
 * the top of every admin Server Component and inside every admin Server Action.
 */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect('/admin/login');
  }
}

/** Non-redirecting check — true when the current request is an authed admin. */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}
