/**
 * Pure helpers for MenuClient. Extracted so the component file stays focused
 * on React state and JSX.
 */

/**
 * Convert a Turkish string into a URL-safe slug. Lowercases, transliterates
 * Turkish-specific characters, replaces non-alphanumeric runs with hyphens,
 * and strips leading/trailing hyphens.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
