/**
 * i18n/config.ts — Localization configuration for Çi Neo Cucina
 *
 * Standalone module — does NOT import from src/lib/types.ts to keep the
 * i18n layer decoupled from the domain model layer. Locale types are
 * intentionally re-declared here; keep them in sync if types.ts changes.
 *
 * This is a localization-ready, TR-first setup. Full next-intl or similar
 * middleware integration can be layered on top of this config without
 * breaking changes.
 */

export const locales = ['tr', 'en', 'de'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

/** Human-readable display names for the locale switcher. */
export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
};

/**
 * Type guard — narrows an arbitrary string to `Locale`.
 *
 * @example
 * const raw = params.lang; // string
 * const locale = isLocale(raw) ? raw : defaultLocale;
 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
