'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import { setReservationStatus, RESERVATION_STATUSES } from '@/lib/db/admin/reservations';
import {
  buildReservationConfirmation,
  buildReservationDeclined,
  resolveEmailLocale,
} from '@/lib/email-content';
import { setSeasonClosure } from '@/lib/db/season-closure';
import { sendNotificationEmail } from '@/lib/email';
import { locales } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { isValidIsoDate, type SeasonClosure } from '@/lib/reservation-closure';
import type { ActionResult } from '@/lib/types';

const schema = z.object({
  id: z.string().uuid('Geçersiz kayıt.'),
  status: z.enum(RESERVATION_STATUSES),
});

/**
 * What became of the guest confirmation mail, so the panel can say so instead
 * of leaving the restaurant to assume the guest was told.
 */
export type ConfirmationNotice =
  | { kind: 'sent'; to: string }
  | { kind: 'no-email' }
  | { kind: 'not-configured' }
  | { kind: 'failed' }
  | { kind: 'none' };

/**
 * Updates a reservation's status, and on a transition to confirmed or declined
 * emails the guest (confirmation, or a polite note inviting a phone call).
 *
 * The status change is what matters and is committed first. A mail that cannot
 * be sent is reported back, never thrown: losing the confirmation because the
 * mail server was down would be worse than sending nothing, and silently
 * swallowing the failure would be worse still — the restaurant would believe
 * the guest had been told.
 */
export async function updateReservationStatusAction(
  id: string,
  status: string,
): Promise<ActionResult<ConfirmationNotice>> {
  await requireAdmin();

  const parsed = schema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz durum değeri.' };
  }

  let change;
  try {
    change = await setReservationStatus(parsed.data.id, parsed.data.status);
  } catch {
    return { ok: false, error: 'Durum güncellenemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');

  const notice = await notifyGuestIfNewlyConfirmed(change);
  return { ok: true, data: notice };
}

const seasonClosureSchema = z
  .object({
    start: z.string().refine(isValidIsoDate, 'Başlangıç tarihi geçersiz.'),
    end: z.string().refine(isValidIsoDate, 'Bitiş tarihi geçersiz.'),
  })
  .refine((value) => value.end >= value.start, {
    message: 'Bitiş tarihi başlangıçtan önce olamaz.',
    path: ['end'],
  });

/** The reservations pages (every language) cache the form; refresh them after a change. */
function revalidateReservationPages(): void {
  revalidatePath('/admin/reservations');
  for (const locale of locales) {
    revalidatePath(localePath('/reservations', locale));
  }
}

/**
 * Sets the dates between which reservation requests are refused. Both ends are
 * inclusive; requests inside the range are stored as declined and the guest is
 * told the season is closed.
 */
export async function saveSeasonClosureAction(
  start: string,
  end: string,
): Promise<ActionResult<SeasonClosure>> {
  await requireAdmin();

  const parsed = seasonClosureSchema.safeParse({ start, end });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz tarih aralığı.' };
  }

  try {
    await setSeasonClosure(parsed.data);
  } catch {
    return { ok: false, error: 'Sezon kapanışı kaydedilemedi. Lütfen tekrar deneyin.' };
  }

  revalidateReservationPages();
  return { ok: true, data: parsed.data };
}

/** Lifts the closure: reservations are accepted for every date again. */
export async function clearSeasonClosureAction(): Promise<ActionResult> {
  await requireAdmin();

  try {
    await setSeasonClosure(null);
  } catch {
    return { ok: false, error: 'Sezon kapanışı kaldırılamadı. Lütfen tekrar deneyin.' };
  }

  revalidateReservationPages();
  return { ok: true };
}

async function notifyGuestIfNewlyConfirmed(change: {
  reservation: {
    name: string;
    email: string | null;
    requestedDate: string;
    requestedTime: string;
    partySize: number;
    status: string;
    locale: string | null;
  };
  previousStatus: string;
}): Promise<ConfirmationNotice> {
  const { reservation, previousStatus } = change;

  // Only a genuine transition: re-confirming (or re-declining) an already
  // settled booking must not send the guest a second copy.
  const isConfirmation = reservation.status === 'confirmed' && previousStatus !== 'confirmed';
  const isDecline = reservation.status === 'declined' && previousStatus !== 'declined';
  if (!isConfirmation && !isDecline) {
    return { kind: 'none' };
  }

  // email is nullable — a guest may have left only a phone number.
  if (!reservation.email) return { kind: 'no-email' };

  // Same language the guest booked in; rows without one get English.
  const locale = resolveEmailLocale(reservation.locale);
  const body = isConfirmation
    ? buildReservationConfirmation(reservation, locale)
    : buildReservationDeclined(reservation, locale);
  const result = await sendNotificationEmail({
    to: reservation.email,
    // A copy of the guest's confirmation, for the restaurant's own records.
    // Unset in development, and on any deployment that does not want one.
    bcc: process.env.GUEST_MAIL_BCC,
    ...body,
  });

  if (result.sent) return { kind: 'sent', to: reservation.email };
  if (result.skipped) return { kind: 'not-configured' };
  return { kind: 'failed' };
}
