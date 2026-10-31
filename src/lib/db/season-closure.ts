import 'server-only';

import { saveReservation } from '@/lib/db/forms';
import { sendNotificationEmail } from '@/lib/email';
import { buildSeasonClosedDecline, resolveEmailLocale } from '@/lib/email-content';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import {
  SEASON_CLOSURE_KEY,
  isDateInSeasonClosure,
  parseSeasonClosure,
  seasonClosedCopy,
  type SeasonClosure,
} from '@/lib/reservation-closure';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ReservationInput } from '@/lib/types';

/**
 * Persistence for the seasonal reservation closure, kept in `site_settings`.
 *
 * Reads use the service-role client on purpose: the anon/server client reads
 * cookies, which would turn the statically revalidated reservations page into a
 * fully dynamic one. Reading fails open — when the setting cannot be read the
 * site keeps taking reservations rather than refusing guests over a database
 * hiccup.
 */

/** The configured closure, or null when none is set (or it cannot be read). */
export async function getSeasonClosure(): Promise<SeasonClosure | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', SEASON_CLOSURE_KEY)
    .maybeSingle();

  if (error || !data) return null;
  return parseSeasonClosure(data.value);
}

/**
 * Refuses a reservation request that falls inside the closed season.
 *
 * The request is still stored, marked declined, so the restaurant can see that
 * someone tried. Returns the guest-facing "Sezon Kapanmıştır" message when the
 * request was refused, or null when the date is open and the caller should carry on.
 */
export async function declineIfSeasonClosed(
  input: ReservationInput,
  locale: Locale | null,
): Promise<string | null> {
  const closure = await getSeasonClosure();
  if (!closure || !isDateInSeasonClosure(input.requestedDate, closure)) return null;

  const guestLocale = locale ?? defaultLocale;

  // Recording the attempt is best effort: the guest is refused either way.
  await saveReservation(input, locale, 'declined');

  // The form already warned them when they picked the date, so this is the
  // fallback for a guest who submitted regardless. A mail that cannot be sent
  // is not an error here — the refusal is also shown on screen.
  if (input.email) {
    await sendNotificationEmail({
      to: input.email,
      bcc: process.env.GUEST_MAIL_BCC,
      ...buildSeasonClosedDecline(input, closure, resolveEmailLocale(locale)),
    }).catch(() => {});
  }

  return seasonClosedCopy(closure, guestLocale).message;
}

/** Sets the closure, or removes it when `closure` is null. Throws on failure. */
export async function setSeasonClosure(closure: SeasonClosure | null): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  if (closure === null) {
    const { error } = await supabase.from('site_settings').delete().eq('key', SEASON_CLOSURE_KEY);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: SEASON_CLOSURE_KEY, value: { start: closure.start, end: closure.end }, is_public: true },
      { onConflict: 'key' },
    );
  if (error) throw new Error(error.message);
}
