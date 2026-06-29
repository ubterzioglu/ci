'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import {
  setReservationStatus,
  RESERVATION_STATUSES,
} from '@/lib/db/admin/reservations';
import type { ActionResult } from '@/lib/types';

const schema = z.object({
  id: z.string().uuid('Geçersiz kayıt.'),
  status: z.enum(RESERVATION_STATUSES),
});

/** Updates a reservation's status. Admin-guarded; revalidates the list. */
export async function updateReservationStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = schema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz durum değeri.' };
  }

  try {
    await setReservationStatus(parsed.data.id, parsed.data.status);
  } catch {
    return { ok: false, error: 'Durum güncellenemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');
  return { ok: true };
}
