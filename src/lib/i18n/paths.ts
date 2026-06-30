/**
 * i18n/paths.ts — locale-aware internal link builder for Çi Neo Cucina.
 *
 * Implements the "unprefixed default" routing strategy: Turkish (the default
 * locale) keeps its bare URLs (`/`, `/menu`, `/about`), while EN/DE are served
 * under a locale prefix (`/en/menu`, `/de/about`). Every internal link in the
 * app should be built through `localePath` so prefixing stays consistent.
 */

import { defaultLocale, type Locale } from './config';

/**
 * Build a locale-correct internal path.
 *
 * - `tr` (default): the path is returned unchanged.
 * - `en` / `de`: the path is prefixed with `/${locale}`; the root `'/'`
 *   collapses to `/${locale}` (e.g. `/de`) rather than `/de/`.
 *
 * The input is normalised to a single leading slash so callers can pass
 * `'menu'` or `'/menu'` interchangeably.
 *
 * @example
 * localePath('/menu', 'tr'); // '/menu'
 * localePath('/menu', 'en'); // '/en/menu'
 * localePath('/', 'de');     // '/de'
 */
export function localePath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (locale === defaultLocale) return normalized;

  if (normalized === '/') return `/${locale}`;

  return `/${locale}${normalized}`;
}
