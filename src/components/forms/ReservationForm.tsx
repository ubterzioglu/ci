'use client';

import { useActionState, useState } from 'react';
import { submitReservation } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { ActionResult } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';
import {
  bookableTimes,
  earliestBookableDate,
  findSlotProblem,
  isClosedDay,
  RESERVATION_MAX_PARTY,
  getReservationRuleLines,
} from '@/lib/reservation-rules';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

/** Sentinel for the "6 or more" choice — not a real party size. */
const LARGE_PARTY_VALUE = 'large';

/** Phone + WhatsApp, shown wherever the form hands the guest off to us. */
function ContactHandoff({ title, body }: { title: string; body: string }) {
  const { contact } = siteConfig;
  const whatsapp = contact.phoneE164.replace(/[^\d]/g, '');

  return (
    <div className="border-terracotta/40 bg-terracotta/5 rounded-md border px-5 py-5">
      <p className="font-display text-charcoal text-xl">{title}</p>
      <p className="font-body text-muted mt-1.5 text-sm leading-relaxed">{body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`tel:${contact.phoneE164}`}
          className="bg-olive hover:bg-olive-deep text-ivory font-body rounded-md px-4 py-2 text-sm font-semibold transition-colors"
        >
          {contact.phoneDisplay}
        </a>
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-olive/40 text-olive hover:bg-olive hover:text-ivory font-body rounded-md border px-4 py-2 text-sm font-semibold transition-colors"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export function ReservationForm({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.forms.reservation;
  const reservationRules = getReservationRuleLines(locale);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    submitReservation,
    null,
  );

  // Earliest selectable day, in the restaurant's own timezone rather than the
  // visitor's — someone booking from another country must not be offered a day
  // that has already passed in Kaş.
  const todayISO = earliestBookableDate();
  const times = bookableTimes();

  // Party size and date drive two "we cannot take this online" states. They are
  // checked again on the server; here they just stop a guest filling in a form
  // that was never going to be accepted.
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const isLargeParty = partySize === LARGE_PARTY_VALUE;
  const slotProblem = date && time ? findSlotProblem(date, time, new Date(), locale) : null;
  const sundayPicked = date ? isClosedDay(date) : false;

  if (state?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-olive/10 rounded-md px-6 py-8 text-center"
      >
        <h2 className="font-display text-olive mb-2 text-2xl">{copy.successTitle}</h2>
        <p className="font-body text-charcoal">{copy.successBody}</p>
      </div>
    );
  }

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {/* Top-level error alert */}
      {state && !state.ok && (
        <div
          role="alert"
          aria-live="assertive"
          className="border-wine bg-wine/10 font-body text-wine rounded-md border px-4 py-3 text-sm"
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
      <input type="hidden" name="locale" value={locale} />

      {/* Paired short fields share a row on sm+ to keep the form above the fold */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="res-name"
          name="name"
          label={copy.fullName}
          required
          autoComplete="name"
          error={fieldErrors['name']?.[0]}
        />

        <Input
          id="res-email"
          name="email"
          type="email"
          label={dictionary.common.email}
          autoComplete="email"
          error={fieldErrors['email']?.[0]}
        />

        <Input
          id="res-phone"
          name="phone"
          type="tel"
          label={dictionary.common.phone}
          autoComplete="tel"
          error={fieldErrors['phone']?.[0]}
        />

        <Select
          id="res-partySize"
          name="partySize"
          label={copy.partySize}
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          error={fieldErrors['partySize']?.[0]}
        >
          {Array.from({ length: RESERVATION_MAX_PARTY }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value={LARGE_PARTY_VALUE}>{RESERVATION_MAX_PARTY + 1}+</option>
        </Select>
      </div>

      {isLargeParty && (
        <ContactHandoff
          title={copy.largePartyTitle}
          body={copy.largePartyBody.replace('{count}', String(RESERVATION_MAX_PARTY + 1))}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="res-requestedDate"
          name="requestedDate"
          type="date"
          label={copy.date}
          required
          min={todayISO}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={fieldErrors['requestedDate']?.[0]}
        />

        <Select
          id="res-requestedTime"
          name="requestedTime"
          label={copy.time}
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          error={fieldErrors['requestedTime']?.[0] ?? slotProblem?.message}
        >
          <option value="">{copy.selectTime}</option>
          {times.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {sundayPicked && (
        <ContactHandoff
          title={copy.sundayTitle}
          body={copy.sundayBody}
        />
      )}

      <Textarea
        id="res-message"
        name="message"
        label={copy.noteLabel}
        placeholder={copy.notePlaceholder}
        rows={2}
        className="min-h-0"
        error={fieldErrors['message']?.[0]}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending ? copy.pending : ''}
      </div>

      <Button
        type="submit"
        variant="solid"
        size="md"
        // Blocked states hand the guest to the phone instead; leaving the
        // button live would only produce a rejection they cannot act on.
        disabled={isPending || isLargeParty || sundayPicked}
        className="w-full"
      >
        {isPending ? copy.pending : copy.submit}
      </Button>

      <ul className="text-muted font-body mt-1 space-y-1 text-xs leading-relaxed">
        {reservationRules.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
    </form>
  );
}

export default ReservationForm;
