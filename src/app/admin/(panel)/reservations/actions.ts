'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import { setReservationStatus, RESERVATION_STATUSES } from '@/lib/db/admin/reservations';
import { buildReservationConfirmation } from '@/lib/email-content';
import { sendNotificationEmail } from '@/lib/email';
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
 * Updates a reservation's status, and on a new→confirmed transition emails the
 * guest.
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

async function notifyGuestIfNewlyConfirmed(change: {
  reservation: {
    name: string;
    email: string | null;
    requestedDate: string;
    requestedTime: string;
    partySize: number;
    status: string;
  };
  previousStatus: string;
}): Promise<ConfirmationNotice> {
  const { reservation, previousStatus } = change;

  // Only a genuine transition: re-confirming an already-confirmed booking
  // must not send the guest a second copy.
  if (reservation.status !== 'confirmed' || previousStatus === 'confirmed') {
    return { kind: 'none' };
  }

  // email is nullable — a guest may have left only a phone number.
  if (!reservation.email) return { kind: 'no-email' };

  const body = buildReservationConfirmation(reservation);
  const result = await sendNotificationEmail({ to: reservation.email, ...body });

  if (result.sent) return { kind: 'sent', to: reservation.email };
  if (result.skipped) return { kind: 'not-configured' };
  return { kind: 'failed' };
}
