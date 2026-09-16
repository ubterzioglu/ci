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
    const { name, email, phone, partySize, requestedDate, requestedTime, message } = result.data;

    // The guest's own contact details belong in the body: without them the
    // restaurant has to open the admin panel just to phone someone back.
    const lines = [
      'Yeni bir rezervasyon talebi alındı.',
      '',
      `Ad: ${name}`,
      `Tarih: ${requestedDate}`,
      `Saat: ${requestedTime}`,
      `Kişi: ${partySize}`,
      `E-posta: ${email || '—'}`,
      `Telefon: ${phone || '—'}`,
      `Not: ${message || '—'}`,
      '',
      'Talebi onaylamak için: /admin/reservations',
    ];

    // Fire-and-forget on the public form: the reservation is already saved and
    // the guest must not see an error just because the notification failed.
    await sendNotificationEmail({
      to: notificationEmail,
      subject: `Yeni Rezervasyon — ${name}, ${requestedDate} ${requestedTime}`,
      text: lines.join('\n'),
      // Lets the restaurant hit Reply and reach the guest directly.
      ...(email ? { replyTo: email } : {}),
    }).catch(() => {});
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
    const { name, email, phone, subject, message } = result.data;
    await sendNotificationEmail({
      to: notificationEmail,
      subject: `Yeni İletişim Mesajı — ${name}`,
      text: [
        'Yeni bir iletişim mesajı alındı.',
        '',
        `Ad: ${name}`,
        `E-posta: ${email || '—'}`,
        `Telefon: ${phone || '—'}`,
        `Konu: ${subject ?? '—'}`,
        '',
        message,
      ].join('\n'),
      ...(email ? { replyTo: email } : {}),
    }).catch(() => {});
  }

  return { ok: true };
}
