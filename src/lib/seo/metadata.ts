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
};

interface BuildMetadataInput {
  title?: string;
  description?: string;
  /** UNPREFIXED path, e.g. "/menu". The locale prefix is applied internally. */
  path?: string;
  /** Active locale; defaults to Turkish (the source locale). */
  locale?: Locale;
  ogImage?: string | null;
  noIndex?: boolean;
}

/**
 * hreflang alternates for a given unprefixed path: one absolute URL per locale
 * plus an `x-default` pointing at the Turkish (default-locale) URL.
 */
function buildLanguageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = new URL(localePath(path, locale), baseUrl).toString();
  }
  alternates['x-default'] = new URL(localePath(path, defaultLocale), baseUrl).toString();
  return alternates;
}

export function buildMetadata({
  title,
  description,
  path = '/',
  locale = defaultLocale,
  ogImage,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const desc = description ?? siteConfig.description;
  const canonical = new URL(localePath(path, locale), baseUrl).toString();
  const image = ogImage ?? new URL(siteConfig.ogDefaultImage, baseUrl).toString();

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      url: canonical,
      locale: OG_LOCALE[locale],
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
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
