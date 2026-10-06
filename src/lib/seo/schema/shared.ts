import { getLocalPage } from '@/content/pages-i18n';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/lib/site-config';

/**
 * Shared constants and helpers for JSON-LD schema builders.
 */

export const baseUrl = siteConfig.url;

/** BCP-47 tags for `inLanguage`, per app locale. */
export const LANGUAGE_TAG: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  ru: 'ru-RU',
  fr: 'fr-FR',
};

/** Stable node IDs. Locale-independent on purpose — see restaurantSchema. */
export const RESTAURANT_ID = `${baseUrl}#restaurant`;
export const WEBSITE_ID = `${baseUrl}#website`;
export const CHEF_ID = `${baseUrl}#chef`;
export const MENU_ID = `${baseUrl}#menu`;

/**
 * The site description in a given locale. Falls back to the Turkish source
 * when a locale has no translated home-page SEO description yet.
 */
export function localizedDescription(locale: Locale): string {
  if (locale === defaultLocale) return siteConfig.description;
  const home = getLocalPage('home', locale);
  return home?.seoDescription ?? home?.excerpt ?? siteConfig.description;
}
