/**
 * Centralised Supabase env resolution.
 *
 * Returns `null` when the public env vars are not configured, which lets the
 * data layer gracefully fall back to local parsed content during development
 * (the brief requires the site to run without Supabase env vars present).
 */

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** Whether the app is configured to talk to Supabase at all. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
