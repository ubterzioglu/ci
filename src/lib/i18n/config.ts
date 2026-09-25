/**
 * i18n/config.ts — Localization configuration for Çi Neo Cucina
 *
 * This is the single source of truth for the site's locales. Adding one here
 * makes TypeScript flag every per-locale map that still needs an entry (the
 * dictionaries, the menu/page overlays, the OG locale map), and the language
 * switcher, sitemap and /[lang] route params all derive from `locales`.
 *
 * This is a localization-ready, TR-first setup. Full next-intl or similar
 * middleware integration can be layered on top of this config without
 * breaking changes.
 */

export const locales = ['tr', 'en', 'de', 'ru'] as const;

export type Locale = (typeof locales)[number];

/** Guest confirmation language order, with English as the default tab. */
export const reservationEmailLocales = ['en', 'tr', 'de', 'ru'] as const satisfies readonly Locale[];

export const defaultLocale = 'tr' as const satisfies Locale;

/**
 * Locales that carry a translation of the Turkish source, i.e. every locale but
 * the default. Admin editors and the translate action iterate this so adding a
 * language to `locales` reaches them without further changes.
 */
export type TranslatableLocale = Exclude<Locale, typeof defaultLocale>;

export const translatableLocales = locales.filter(
  (locale): locale is TranslatableLocale => locale !== defaultLocale,
);

/** Human-readable display names for the locale switcher. */
export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  ru: 'Русский',
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
