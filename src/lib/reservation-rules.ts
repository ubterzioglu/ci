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

import { defaultLocale, type Locale } from '@/lib/i18n/config';

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
  locale: Locale = defaultLocale,
): SlotProblem | null {
  const messages = reservationMessagesByLocale[locale];
  const weekday = weekdayOfIsoDate(isoDate);
  if (weekday === null) {
    return { field: 'requestedDate', message: messages.invalidDate };
  }
  if (weekday === RESERVATION_CLOSED_WEEKDAY) {
    return {
      field: 'requestedDate',
      message: messages.closedSunday,
    };
  }

  const requested = parseTimeToMinutes(time);
  if (requested === null) {
    return { field: 'requestedTime', message: messages.invalidTime };
  }

  const opens = parseTimeToMinutes(RESERVATION_OPENS)!;
  const closes = parseTimeToMinutes(RESERVATION_CLOSES)!;
  if (requested < opens || requested > closes) {
    return {
      field: 'requestedTime',
      message: messages.outsideHours,
    };
  }

  const now = istanbulNow(reference);
  if (isoDate < now.date) {
    return { field: 'requestedDate', message: messages.pastDate };
  }

  // The lead time only bites on the current day; any later date clears it.
  if (isoDate === now.date) {
    const leadMinutes = RESERVATION_MIN_LEAD_HOURS * 60;
    if (requested - now.minutes < leadMinutes) {
      return {
        field: 'requestedTime',
        message: messages.leadTime,
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
interface ReservationMessages {
  invalidDate: string;
  closedSunday: string;
  invalidTime: string;
  outsideHours: string;
  pastDate: string;
  leadTime: string;
  rules: readonly string[];
}

const reservationMessagesByLocale: Record<Locale, ReservationMessages> = {
  tr: {
    invalidDate: 'Lütfen geçerli bir tarih seçin.',
    closedSunday: 'Pazar günleri kapalıyız. Özel günler için lütfen bizimle iletişime geçin.',
    invalidTime: 'Lütfen geçerli bir saat seçin.',
    outsideHours: `Rezervasyon saatleri ${RESERVATION_OPENS} – ${RESERVATION_CLOSES} arasındadır.`,
    pastDate: 'Geçmiş bir tarih seçilemez.',
    leadTime: `Rezervasyonlar en az ${RESERVATION_MIN_LEAD_HOURS} saat önceden alınır. Daha erken bir saat için lütfen bizi arayın.`,
    rules: [
      `Rezervasyon saatlerimiz ${RESERVATION_OPENS} – ${RESERVATION_CLOSES} arasındadır.`,
      `Rezervasyonlar en az ${RESERVATION_MIN_LEAD_HOURS} saat önceden alınır.`,
      `${RESERVATION_MAX_PARTY + 1} kişi ve üzeri gruplar için lütfen bizimle iletişime geçin.`,
      'Pazar günleri kapalıyız; özel günlerde açıyoruz, lütfen bizi arayın.',
    ],
  },
  en: {
    invalidDate: 'Please select a valid date.',
    closedSunday: 'We are closed on Sundays. Please contact us for special occasions.',
    invalidTime: 'Please select a valid time.',
    outsideHours: `Reservation hours are from ${RESERVATION_OPENS} to ${RESERVATION_CLOSES}.`,
    pastDate: 'A past date cannot be selected.',
    leadTime: `Reservations must be made at least ${RESERVATION_MIN_LEAD_HOURS} hours in advance. Please call us for an earlier time.`,
    rules: [
      `Reservation hours are from ${RESERVATION_OPENS} to ${RESERVATION_CLOSES}.`,
      `Reservations must be made at least ${RESERVATION_MIN_LEAD_HOURS} hours in advance.`,
      `Please contact us for groups of ${RESERVATION_MAX_PARTY + 1} or more.`,
      'We are closed on Sundays; we open for special occasions, so please call us.',
    ],
  },
  de: {
    invalidDate: 'Bitte wählen Sie ein gültiges Datum.',
    closedSunday: 'Sonntags haben wir geschlossen. Für besondere Anlässe kontaktieren Sie uns bitte.',
    invalidTime: 'Bitte wählen Sie eine gültige Uhrzeit.',
    outsideHours: `Reservierungen sind zwischen ${RESERVATION_OPENS} und ${RESERVATION_CLOSES} Uhr möglich.`,
    pastDate: 'Ein Datum in der Vergangenheit kann nicht gewählt werden.',
    leadTime: `Reservierungen müssen mindestens ${RESERVATION_MIN_LEAD_HOURS} Stunden im Voraus erfolgen. Für eine frühere Uhrzeit rufen Sie uns bitte an.`,
    rules: [
      `Reservierungen sind zwischen ${RESERVATION_OPENS} und ${RESERVATION_CLOSES} Uhr möglich.`,
      `Reservierungen müssen mindestens ${RESERVATION_MIN_LEAD_HOURS} Stunden im Voraus erfolgen.`,
      `Für Gruppen ab ${RESERVATION_MAX_PARTY + 1} Personen kontaktieren Sie uns bitte.`,
      'Sonntags haben wir geschlossen; für besondere Anlässe öffnen wir nach Absprache.',
    ],
  },
  ru: {
    invalidDate: 'Выберите корректную дату.',
    closedSunday: 'По воскресеньям мы закрыты. Свяжитесь с нами по поводу особых мероприятий.',
    invalidTime: 'Выберите корректное время.',
    outsideHours: `Бронирование доступно с ${RESERVATION_OPENS} до ${RESERVATION_CLOSES}.`,
    pastDate: 'Нельзя выбрать прошедшую дату.',
    leadTime: `Бронировать необходимо минимум за ${RESERVATION_MIN_LEAD_HOURS} часа. Для более раннего времени позвоните нам.`,
    rules: [
      `Бронирование доступно с ${RESERVATION_OPENS} до ${RESERVATION_CLOSES}.`,
      `Бронировать необходимо минимум за ${RESERVATION_MIN_LEAD_HOURS} часа.`,
      `Для групп от ${RESERVATION_MAX_PARTY + 1} человек свяжитесь с нами.`,
      'По воскресеньям мы закрыты; для особых мероприятий можем открыться по договорённости.',
    ],
  },
  fr: {
    invalidDate: 'Veuillez sélectionner une date valide.',
    closedSunday: 'Nous sommes fermés le dimanche. Veuillez nous contacter pour les occasions spéciales.',
    invalidTime: 'Veuillez sélectionner une heure valide.',
    outsideHours: `Les réservations sont possibles de ${RESERVATION_OPENS} à ${RESERVATION_CLOSES}.`,
    pastDate: 'Impossible de sélectionner une date passée.',
    leadTime: `Les réservations doivent être effectuées au moins ${RESERVATION_MIN_LEAD_HOURS} heures à l'avance. Pour un créneau plus tôt, veuillez nous appeler.`,
    rules: [
      `Nos horaires de réservation sont de ${RESERVATION_OPENS} à ${RESERVATION_CLOSES}.`,
      `Les réservations doivent être effectuées au moins ${RESERVATION_MIN_LEAD_HOURS} heures à l'avance.`,
      `Pour les groupes de ${RESERVATION_MAX_PARTY + 1} personnes ou plus, veuillez nous contacter.`,
      'Nous sommes fermés le dimanche ; nous ouvrons pour les occasions spéciales, veuillez nous appeler.',
    ],
  },
};

export function getReservationRuleLines(locale: Locale): readonly string[] {
  return reservationMessagesByLocale[locale].rules;
}

/** Default-language compatibility for server/API consumers. */
export const RESERVATION_RULE_LINES = reservationMessagesByLocale.tr.rules;
