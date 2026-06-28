'use server';

import { reservationSchema, contactSchema } from '@/lib/validation';
import { saveReservation, saveContactMessage } from '@/lib/db/forms';
import { sendNotificationEmail } from '@/lib/email';
import type { ActionResult } from '@/lib/types';

export async function submitReservation(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    partySize: formData.get('partySize'),
    requestedDate: formData.get('requestedDate'),
    requestedTime: formData.get('requestedTime'),
    message: formData.get('message'),
    company: formData.get('company'),
  };

  // Honeypot: silently succeed for bots that fill the hidden field.
  if (raw.company) {
    return { ok: true };
  }

  const result = reservationSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      ok: false,
      error: 'Lütfen formdaki hataları düzeltin.',
      fieldErrors,
    };
  }

  const persistResult = await saveReservation(result.data);

  if (!persistResult.ok) {
    if (persistResult.reason === 'not-configured') {
      console.warn('[actions] Supabase is not configured — reservation not persisted.');
      return { ok: true };
    }
    return {
      ok: false,
      error: 'Talebiniz kaydedilemedi. Lütfen telefonla iletişime geçin.',
    };
  }

  const notificationEmail = process.env.RESERVATION_NOTIFICATION_EMAIL;
  if (notificationEmail) {
    await sendNotificationEmail({
      to: notificationEmail,
      subject: 'Yeni Rezervasyon Talebi — Çi Neo Cucina',
      text: `Yeni bir rezervasyon talebi alındı.\n\nAd: ${result.data.name}\nTarih: ${result.data.requestedDate}\nSaat: ${result.data.requestedTime}\nKişi: ${result.data.partySize}`,
    }).catch(() => {
      // Fire-and-forget: ignore email failures.
    });
  }

  return { ok: true };
}

export async function submitContact(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    company: formData.get('company'),
  };

  // Honeypot: silently succeed for bots that fill the hidden field.
  if (raw.company) {
    return { ok: true };
  }

  const result = contactSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      ok: false,
      error: 'Lütfen formdaki hataları düzeltin.',
      fieldErrors,
    };
  }

  const persistResult = await saveContactMessage(result.data);

  if (!persistResult.ok) {
    if (persistResult.reason === 'not-configured') {
      console.warn('[actions] Supabase is not configured — contact message not persisted.');
      return { ok: true };
    }
    return {
      ok: false,
      error: 'Mesajınız gönderilemedi. Lütfen telefonla iletişime geçin.',
    };
  }

  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (notificationEmail) {
    await sendNotificationEmail({
      to: notificationEmail,
      subject: 'Yeni İletişim Mesajı — Çi Neo Cucina',
      text: `Yeni bir iletişim mesajı alındı.\n\nAd: ${result.data.name}\nKonu: ${result.data.subject ?? '—'}\nMesaj: ${result.data.message}`,
    }).catch(() => {
      // Fire-and-forget: ignore email failures.
    });
  }

  return { ok: true };
}
