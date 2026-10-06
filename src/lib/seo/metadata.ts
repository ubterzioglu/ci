import type { Metadata } from 'next';

import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

/**
 * Shared metadata helpers. `buildMetadata` produces consistent canonical URLs,
 * locale-aware hreflang alternates, Open Graph and Twitter cards for every page
 * from a small set of inputs.
 */

const baseUrl = siteConfig.url;

/** OpenGraph locale codes per app locale. */
const OG_LOCALE: Record<Locale, string> = {
  tr: 'tr_TR',
  en: 'en_US',
  de: 'de_DE',
  ru: 'ru_RU',
  fr: 'fr_FR',
};

export function buildGeoMetadata(): NonNullable<Metadata['other']> {
  const { contact, geo } = siteConfig;

  if (geo.latitude === null || geo.longitude === null) {
    return {};
  }

  const latitude = String(geo.latitude);
  const longitude = String(geo.longitude);
  const placeName = `${contact.locality}, ${contact.administrativeArea}, ${contact.countryName}`;

  return {
    'geo.region': `${contact.countryCode}-${contact.administrativeAreaCode}`,
    'geo.placename': placeName,
    'geo.position': `${latitude};${longitude}`,
    ICBM: `${latitude}, ${longitude}`,
    'place:location:latitude': latitude,
    'place:location:longitude': longitude,
  };
}

/**
 * Locale `x-default` points at. This is the page served to a visitor whose
 * language matches no hreflang — an Italian, Dutch or Polish tourist looking
 * for dinner in Kaş. English serves them; Turkish does not, which is why
 * x-default is NOT the default locale here despite TR being the source.
 */
const X_DEFAULT_LOCALE: Locale = 'en';

interface BuildMetadataInput {
  title?: string;
  /**
   * Complete `<title>`, used verbatim — no " | Çi Neo Cucina" suffix. Takes
   * precedence over `title`. Pages use this via seoTitle() so the location
   * keyword fits inside the length Google renders; see lib/seo/titles.ts.
   */
  absoluteTitle?: string;
  description?: string;
  /** UNPREFIXED path, e.g. "/menu". The locale prefix is applied internally. */
  path?: string;
  /** Active locale; defaults to Turkish (the source locale). */
  locale?: Locale;
  ogImage?: string | null;
  noIndex?: boolean;
  /**
   * Emit hreflang alternates for every locale. Set to `false` for pages that
   * exist only in Turkish: pointing hreflang at /en/… URLs that 404 is a broken
   * signal to crawlers, not a neutral one. Such pages get a canonical only.
   */
  localeAlternates?: boolean;
}

/**
 * hreflang alternates for a given unprefixed path: one absolute URL per locale
 * plus an `x-default` pointing at the English URL (see X_DEFAULT_LOCALE).
 */
function buildLanguageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = new URL(localePath(path, locale), baseUrl).toString();
  }
  alternates['x-default'] = new URL(localePath(path, X_DEFAULT_LOCALE), baseUrl).toString();
  return alternates;
}

export function buildMetadata({
  title,
  absoluteTitle,
  description,
  path = '/',
  locale = defaultLocale,
  ogImage,
  noIndex = false,
  localeAlternates = true,
}: BuildMetadataInput): Metadata {
  const fullTitle = absoluteTitle ?? (title ? `${title} | ${siteConfig.name}` : siteConfig.name);
  const desc = description ?? siteConfig.description;
  const canonical = new URL(localePath(path, locale), baseUrl).toString();
  const image = ogImage ?? new URL(siteConfig.ogDefaultImage, baseUrl).toString();

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical,
      ...(localeAlternates ? { languages: buildLanguageAlternates(path) } : {}),
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      url: canonical,
      locale: OG_LOCALE[locale],
      // og:locale:alternate tells sharing platforms the other language
      // versions exist. Omitted for TR-only pages, which have no alternates.
      ...(localeAlternates
        ? {
            alternateLocale: locales
              .filter((other) => other !== locale)
              .map((other) => OG_LOCALE[other]),
          }
        : {}),
      // The share-card alt follows the locale rather than repeating the brand
      // name in every language.
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
