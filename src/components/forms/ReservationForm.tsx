'use client';

import { useActionState } from 'react';
import { submitReservation } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { ActionResult } from '@/lib/types';

export function ReservationForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    submitReservation,
    null,
  );

  // Computed per render in the user's local timezone (Intl 'en-CA' yields
  // YYYY-MM-DD). Avoids the UTC drift and stale-tab issues of a module-scope
  // toISOString() value, so `min` always reflects "today" for the visitor.
  const todayISO = new Date().toLocaleDateString('en-CA');

  if (state?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md bg-olive/10 px-6 py-8 text-center"
      >
        <h2 className="font-display text-2xl text-olive mb-2">Talebiniz alındı</h2>
        <p className="font-body text-charcoal">
          Rezervasyon talebinizi aldık. En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>
    );
  }

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {/* Top-level error alert */}
      {state && !state.ok && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-wine bg-wine/10 px-4 py-3 font-body text-sm text-wine"
        >
          {state.error}
        </div>
      )}

      {/* Honeypot — must stay empty */}
      <input
        type="text"
        name="company"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
      />

      <Input
        id="res-name"
        name="name"
        label="Ad Soyad"
        required
        autoComplete="name"
        error={fieldErrors['name']?.[0]}
      />

      <Input
        id="res-email"
        name="email"
        type="email"
        label="E-posta"
        autoComplete="email"
        error={fieldErrors['email']?.[0]}
      />

      <Input
        id="res-phone"
        name="phone"
        type="tel"
        label="Telefon"
        autoComplete="tel"
        error={fieldErrors['phone']?.[0]}
      />

      <Select
        id="res-partySize"
        name="partySize"
        label="Kişi Sayısı"
        defaultValue="2"
        error={fieldErrors['partySize']?.[0]}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Select>
      <p className="-mt-3 text-xs text-muted">
        12 kişiden büyük gruplar için lütfen telefonla iletişime geçin.
      </p>

      <Input
        id="res-requestedDate"
        name="requestedDate"
        type="date"
        label="Tarih"
        required
        min={todayISO}
        error={fieldErrors['requestedDate']?.[0]}
      />

      <Input
        id="res-requestedTime"
        name="requestedTime"
        type="time"
        label="Saat"
        required
        error={fieldErrors['requestedTime']?.[0]}
      />

      <Textarea
        id="res-message"
        name="message"
        label="Notunuz (isteğe bağlı)"
        placeholder="Özel istek, alerji bilgisi vb."
        error={fieldErrors['message']?.[0]}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending ? 'Gönderiliyor…' : ''}
      </div>

      <Button
        type="submit"
        variant="solid"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Gönderiliyor…' : 'Rezervasyon Talep Et'}
      </Button>
    </form>
  );
}

export default ReservationForm;
