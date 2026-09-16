/**
 * Small shared utilities.
 */

/** Join class names, dropping falsy values. Lightweight clsx replacement. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a price in the given currency for Turkish locale (e.g. ₺580). */
export function formatPrice(price: number | null, currency = 'TRY'): string | null {
  if (price === null || price === undefined) return null;
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

/**
 * Render a reservation's date + time in Turkish, e.g. "20 Eylül 2026 19:30".
 *
 * `date` is an ISO date (YYYY-MM-DD) and `time` is HH:MM[:SS], straight from
 * reservation_requests. Falls back to the raw values if they will not parse, so
 * a malformed row still shows something rather than "Invalid Date".
 *
 * Shared by the admin list and the guest confirmation email so the guest sees
 * the same wording the restaurant does.
 */
export function formatReservationDateTime(date: string, time: string): string {
  try {
    const parsed = new Date(`${date}T${time}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // fall through to the raw values
  }
  return `${date} ${time}`;
}

export const currentYear = (): number => new Date().getFullYear();
