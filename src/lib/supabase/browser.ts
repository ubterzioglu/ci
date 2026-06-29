'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './database.types';

/**
 * Browser-side Supabase client (anon key) for the admin login form.
 *
 * Uses the @supabase/ssr browser client so the auth session is written to
 * cookies that the server (proxy + Server Components) can read. Only used on
 * the client for sign-in / password reset; all privileged reads and writes go
 * through server actions guarded by requireAdmin().
 *
 * Returns `null` when the public env vars are absent so the login UI can show a
 * clear "Supabase yapılandırılmamış" state instead of throwing.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createBrowserClient<Database>(url, anonKey);
}
