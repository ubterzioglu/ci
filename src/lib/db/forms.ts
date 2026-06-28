import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { ContactInput, ReservationInput } from '@/lib/types';

/**
 * Persistence for the two public forms.
 *
 * Writes run server-side. We prefer the service-role (admin) client because it
 * can insert AND return the new row id in one round-trip. The anon client can
 * also insert (the public INSERT RLS policies allow it) but CANNOT read the row
 * back — there is intentionally no public SELECT policy on these tables — so a
 * `.select()` after an anon insert would fail RLS. When only the anon client is
 * available we therefore insert without returning, and report `id: null`.
 *
 * Submissions are never exposed publicly; staff read them via the dashboard or
 * a future authenticated admin surface.
 */

export type PersistResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: 'not-configured' | 'error'; detail?: string };

interface ReservationRow {
  name: string;
  email: string | null;
  phone: string | null;
  party_size: number;
  requested_date: string;
  requested_time: string;
  message: string | null;
  status: 'new';
  source: 'website';
}

interface ContactRow {
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new';
  source: 'website';
}

export async function saveReservation(input: ReservationInput): Promise<PersistResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not-configured' };

  const row: ReservationRow = {
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    party_size: input.partySize,
    requested_date: input.requestedDate,
    requested_time: input.requestedTime,
    message: input.message || null,
    status: 'new',
    source: 'website',
  };

  // Preferred path: service-role client can insert and return the id.
  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from('reservation_requests')
      .insert(row)
      .select('id')
      .single();
    if (error) return { ok: false, reason: 'error', detail: error.message };
    return { ok: true, id: data?.id ?? null };
  }

  // Fallback: anon client may insert but not read back (no public SELECT policy).
  const anon = await createSupabaseServerClient();
  if (!anon) return { ok: false, reason: 'not-configured' };

  const { error } = await anon.from('reservation_requests').insert(row);
  if (error) return { ok: false, reason: 'error', detail: error.message };
  return { ok: true, id: null };
}

export async function saveContactMessage(input: ContactInput): Promise<PersistResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not-configured' };

  const row: ContactRow = {
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    subject: input.subject || null,
    message: input.message,
    status: 'new',
    source: 'website',
  };

  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from('contact_messages')
      .insert(row)
      .select('id')
      .single();
    if (error) return { ok: false, reason: 'error', detail: error.message };
    return { ok: true, id: data?.id ?? null };
  }

  const anon = await createSupabaseServerClient();
  if (!anon) return { ok: false, reason: 'not-configured' };

  const { error } = await anon.from('contact_messages').insert(row);
  if (error) return { ok: false, reason: 'error', detail: error.message };
  return { ok: true, id: null };
}
