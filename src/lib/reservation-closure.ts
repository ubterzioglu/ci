/**
 * Seasonal closure: a date range (inclusive) during which the restaurant takes
 * no reservations.
 *
 * Kept free of `server-only` so the form (client), the server action and the
 * admin panel share one definition of "is this date closed" and one wording of
 * the message. Persistence lives in `@/lib/db/season-closure`.
 */

import type { Locale } from '@/lib/i18n/config';

/** `site_settings.key` the closure is stored under. */
export const SEASON_CLOSURE_KEY = 'reservation_season_closure';

/** Both ends inclusive, as ISO calendar dates (YYYY-MM-DD). */
export interface SeasonClosure {
  start: string;
  end: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date — rejects shapes like 2026-02-31 that a Date would roll over. */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Reads a stored value; anything malformed counts as "no closure". */
export function parseSeasonClosure(value: unknown): SeasonClosure | null {
  if (typeof value !== 'object' || value === null) return null;
  const { start, end } = value as Record<string, unknown>;
  if (typeof start !== 'string' || typeof end !== 'string') return null;
  if (!isValidIsoDate(start) || !isValidIsoDate(end) || end < start) return null;
  return { start, end };
}

export function isDateInSeasonClosure(isoDate: string, closure: SeasonClosure | null): boolean {
  return closure !== null && isoDate >= closure.start && isoDate <= closure.end;
}

function isoParts(isoDate: string): [number, number, number] {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  return [year, month, day];
}

/** "31 Ekim 2026"-style date, read as a calendar date rather than an instant. */
export function formatIsoDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoParts(isoDate);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** The calendar day `days` away from an ISO date (negative goes back). */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoParts(isoDate);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

interface SeasonClosedTemplate {
  title: string;
  /** `lastService` is the final open day, `reopening` the first open day again. */
  body: (lastService: string, reopening: string) => string;
}

const seasonClosedByLocale: Record<Locale, SeasonClosedTemplate> = {
  tr: {
    title: 'Sezon Kapanmıştır',
    body: (lastService, reopening) =>
      `${lastService} bu sezon için son servis günümüz. ${reopening} itibariyle görüşmek üzere.`,
  },
  en: {
    title: 'Season Closed',
    body: (lastService, reopening) =>
      `${lastService} is our last service day of this season. See you from ${reopening}.`,
  },
  de: {
    title: 'Saison beendet',
    body: (lastService, reopening) =>
      `Am ${lastService} ist unser letzter Servicetag dieser Saison. Wir sehen uns ab dem ${reopening}.`,
  },
  ru: {
    title: 'Сезон закрыт',
    body: (lastService, reopening) =>
      `${lastService} — наш последний день работы в этом сезоне. Увидимся с ${reopening}.`,
  },
  fr: {
    title: 'Saison terminée',
    body: (lastService, reopening) =>
      `Le ${lastService} est notre dernier jour de service de la saison. À très bientôt, à partir du ${reopening}.`,
  },
};

export interface SeasonClosedCopy {
  title: string;
  body: string;
  /** Title and body as one sentence pair, for places that show a single line. */
  message: string;
}

/** The guest-facing "Sezon Kapanmıştır" wording, in the guest's language. */
export function seasonClosedCopy(closure: SeasonClosure, locale: Locale): SeasonClosedCopy {
  const template = seasonClosedByLocale[locale];
  // The closure is the closed days; the guest-facing dates are the open days on either side.
  const body = template.body(
    formatIsoDate(addDaysToIsoDate(closure.start, -1), locale),
    formatIsoDate(addDaysToIsoDate(closure.end, 1), locale),
  );
  return { title: template.title, body, message: `${template.title}. ${body}` };
}
