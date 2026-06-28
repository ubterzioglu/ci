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

export const currentYear = (): number => new Date().getFullYear();
