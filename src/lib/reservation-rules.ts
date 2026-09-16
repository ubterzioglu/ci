/**
 * The restaurant's booking rules, in one place.
 *
 * The form, the server-side validation and the text shown to guests all read
 * from here, so a rule cannot be enforced in one place and described
 * differently in another.
 *
 * Every time comparison happens in Europe/Istanbul rather than the machine's
 * clock: the site is deployed in a container that runs on UTC, so "two hours
 * from now" worked out in local server time would be three hours off in summer.
 */

/** Earliest bookable seating (24h, Istanbul). */
export const RESERVATION_OPENS = '18:00';

/** Latest bookable seating. */
export const RESERVATION_CLOSES = '22:00';

/**
 * How far ahead a booking must be made.
 *
 * Not a technical limit — during service a request arriving for "in twenty
 * minutes" can easily be missed, and the guest turns up to a table that was
 * never held.
 */
export const RESERVATION_MIN_LEAD_HOURS = 2;

/** Largest party the online form accepts; bigger groups are arranged by phone. */
export const RESERVATION_MAX_PARTY = 5;

/** Closed on Sundays (0 = Sunday), apart from special occasions arranged directly. */
export const RESERVATION_CLOSED_WEEKDAY = 0;

export const RESTAURANT_TIME_ZONE = 'Europe/Istanbul';

/* --- Istanbul-local time helpers ------------------------------------------- */

/** Parse "HH:MM" into minutes past midnight; null when malformed. */
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** The parts of "now" as they read on a clock in Istanbul. */
function istanbulNow(reference: Date): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RESTAURANT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(reference);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  // en-CA gives ISO-shaped date parts, and hourCycle h23 can report "24" at midnight.
  const hour = Number(get('hour')) % 24;

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: hour * 60 + Number(get('minute')),
  };
}

/** Weekday (0 = Sunday) of an ISO date, read as a calendar date, not an instant. */
export function weekdayOfIsoDate(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const asUtc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(asUtc.getTime())) return null;
  return asUtc.getUTCDay();
}

export function isClosedDay(isoDate: string): boolean {
  return weekdayOfIsoDate(isoDate) === RESERVATION_CLOSED_WEEKDAY;
}

/** Today in Istanbul as YYYY-MM-DD — the earliest date the form should offer. */
export function earliestBookableDate(reference: Date = new Date()): string {
  return istanbulNow(reference).date;
}

export interface SlotProblem {
  field: 'requestedDate' | 'requestedTime' | 'partySize';
  message: string;
}

/**
 * Check one requested slot against every rule.
 *
 * Returns the first problem found, or null when the slot is bookable. Used by
 * the Zod schema (authoritative) and mirrored by the form for immediate
 * feedback.
 */
export function findSlotProblem(
  isoDate: string,
  time: string,
  reference: Date = new Date(),
): SlotProblem | null {
  const weekday = weekdayOfIsoDate(isoDate);
  if (weekday === null) {
    return { field: 'requestedDate', message: 'Lütfen geçerli bir tarih seçin.' };
  }
  if (weekday === RESERVATION_CLOSED_WEEKDAY) {
    return {
      field: 'requestedDate',
      message: 'Pazar günleri kapalıyız. Özel günler için lütfen bizimle iletişime geçin.',
    };
  }

  const requested = parseTimeToMinutes(time);
  if (requested === null) {
    return { field: 'requestedTime', message: 'Lütfen geçerli bir saat seçin.' };
  }

  const opens = parseTimeToMinutes(RESERVATION_OPENS)!;
  const closes = parseTimeToMinutes(RESERVATION_CLOSES)!;
  if (requested < opens || requested > closes) {
    return {
      field: 'requestedTime',
      message: `Rezervasyon saatleri ${RESERVATION_OPENS} – ${RESERVATION_CLOSES} arasındadır.`,
    };
  }

  const now = istanbulNow(reference);
  if (isoDate < now.date) {
    return { field: 'requestedDate', message: 'Geçmiş bir tarih seçilemez.' };
  }

  // The lead time only bites on the current day; any later date clears it.
  if (isoDate === now.date) {
    const leadMinutes = RESERVATION_MIN_LEAD_HOURS * 60;
    if (requested - now.minutes < leadMinutes) {
      return {
        field: 'requestedTime',
        message: `Rezervasyonlar en az ${RESERVATION_MIN_LEAD_HOURS} saat önceden alınır. Daha erken bir saat için lütfen bizi arayın.`,
      };
    }
  }

  return null;
}

/** Every bookable "HH:MM" on the half hour, for the form's dropdown. */
export function bookableTimes(): string[] {
  const opens = parseTimeToMinutes(RESERVATION_OPENS)!;
  const closes = parseTimeToMinutes(RESERVATION_CLOSES)!;
  const times: string[] = [];
  for (let minutes = opens; minutes <= closes; minutes += 30) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    times.push(`${hh}:${mm}`);
  }
  return times;
}

/** The rules as guest-facing Turkish lines — shown on the form and contact page. */
export const RESERVATION_RULE_LINES: readonly string[] = [
  `Rezervasyon saatlerimiz ${RESERVATION_OPENS} – ${RESERVATION_CLOSES} arasındadır.`,
  `Rezervasyonlar en az ${RESERVATION_MIN_LEAD_HOURS} saat önceden alınır.`,
  `${RESERVATION_MAX_PARTY + 1} kişi ve üzeri gruplar için lütfen bizimle iletişime geçin.`,
  'Pazar günleri kapalıyız; özel günlerde açıyoruz, lütfen bizi arayın.',
] as const;
