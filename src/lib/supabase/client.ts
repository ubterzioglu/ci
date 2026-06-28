'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './database.types';

/**
 * Browser Supabase client (anon key only — RLS-enforced).
 *
 * Only used by Client Components that need direct Supabase access. The public
 * form submissions go through Server Actions instead, so this is provided for
 * completeness / future use (e.g. realtime). Never import the service role
 * key here — `NEXT_PUBLIC_` vars are the only ones available in the browser.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
