import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

/**
 * Server-side Supabase client (anon key, RLS-enforced).
 *
 * Uses the @supabase/ssr cookie pattern so auth sessions (if added later)
 * are read/written correctly in Server Components, Route Handlers and
 * Server Actions. For purely public reads this still works fine.
 *
 * Returns `null` when Supabase env vars are absent so callers can fall back
 * to local content during development.
 */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` can be called from a Server Component where mutating
          // cookies is not allowed. Safe to ignore when middleware refreshes
          // sessions, and irrelevant for anonymous public reads.
        }
      },
    },
  });
}
