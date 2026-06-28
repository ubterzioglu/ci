import { NextResponse } from 'next/server';

import { reservationSchema } from '@/lib/validation';
import { saveReservation } from '@/lib/db/forms';

/**
 * JSON API for reservation requests (alternative to the Server Action; useful
 * for external integrations). Validates with Zod, inserts via the db layer.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Geçersiz istek.' }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Doğrulama hatası.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot — pretend success for bots.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const result = await saveReservation({
    name: parsed.data.name,
    email: parsed.data.email || undefined,
    phone: parsed.data.phone || undefined,
    partySize: parsed.data.partySize,
    requestedDate: parsed.data.requestedDate,
    requestedTime: parsed.data.requestedTime,
    message: parsed.data.message || undefined,
  });

  if (!result.ok && result.reason === 'error') {
    return NextResponse.json(
      { ok: false, error: 'Talebiniz kaydedilemedi.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
