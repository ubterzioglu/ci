import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

/**
 * Privileged Supabase client using the service-role key (bypasses RLS).
 *
 * SERVER ONLY — guarded by `server-only` so it can never be bundled into a
 * client component. Used for trusted server-side writes such as inserting form
 * submissions when we want to bypass the public INSERT policy constraints, and
 * by the seed script. Returns `null` if the service role key is not set.
 *
 * Never expose the returned client or its key to the browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
