import { NextResponse } from 'next/server';

import { contactSchema } from '@/lib/validation';
import { saveContactMessage } from '@/lib/db/forms';

/**
 * JSON API for contact messages (alternative to the Server Action).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Geçersiz istek.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Doğrulama hatası.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const result = await saveContactMessage({
    name: parsed.data.name,
    email: parsed.data.email || undefined,
    phone: parsed.data.phone || undefined,
    subject: parsed.data.subject || undefined,
    message: parsed.data.message,
  });

  if (!result.ok && result.reason === 'error') {
    return NextResponse.json({ ok: false, error: 'Mesajınız kaydedilemedi.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
