import { getLocalPage } from '@/content/pages-i18n';
import { aboutContent } from '@/content/pages-data';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';
import type { MenuCategory } from '@/lib/types';

/**
 * JSON-LD structured data builders. Each returns a plain object that is
 * embedded via a <script type="application/ld+json"> tag.
 */

const baseUrl = siteConfig.url;

/** BCP-47 tags for `inLanguage`, per app locale. */
const LANGUAGE_TAG: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  ru: 'ru-RU',
  fr: 'fr-FR',
};

/** Stable node IDs. Locale-independent on purpose — see restaurantSchema. */
const RESTAURANT_ID = `${baseUrl}#restaurant`;
const CHEF_ID = `${baseUrl}#chef`;
const MENU_ID = `${baseUrl}#menu`;

/**
 * The site description in a given locale. Falls back to the Turkish source
 * when a locale has no translated home-page SEO description yet.
 */
function localizedDescription(locale: Locale): string {
  if (locale === defaultLocale) return siteConfig.description;
  const home = getLocalPage('home', locale);
  return home?.seoDescription ?? home?.excerpt ?? siteConfig.description;
}

export function restaurantSchema(locale: Locale = defaultLocale): Record<string, unknown> {
  const { contact, geo, social, hours } = siteConfig;
  const mapsUrl =
    geo.latitude !== null && geo.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${geo.latitude},${geo.longitude}`
      : contact.mapsUrl;

  // PostalAddress — streetAddress only when a real address is known.
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressLocality: contact.locality,
    addressRegion: contact.administrativeArea,
    postalCode: contact.postalCode,
    addressCountry: contact.countryCode,
  };
  if (contact.address) address.streetAddress = contact.address;

  // Social/listing profiles for entity disambiguation (Google "sameAs").
  const sameAs = [
    social.instagram,
    social.facebook,
    social.tripadvisor,
    social.wanderlog,
    social.restaurantGuru,
    mapsUrl,
  ].filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );

  const image = new URL(siteConfig.ogDefaultImage, baseUrl).toString();
  const reservationsUrl = new URL(localePath('/reservations', locale), baseUrl).toString();

  /**
   * `@id` and `url` stay on the unprefixed (Turkish) root in every locale:
   * this is ONE business, and emitting a per-locale id would split it into
   * five entities, which is exactly how a restaurant ends up with its hours
   * attached to one language and its address to another. Only the
   * human-readable fields follow the locale.
   */
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': RESTAURANT_ID,
    name: siteConfig.name,
    description: localizedDescription(locale),
    inLanguage: LANGUAGE_TAG[locale],
    url: baseUrl,
    servesCuisine: ['Mediterranean', 'Anatolian', 'Seafood'],
    priceRange: '₺₺₺',
    currenciesAccepted: 'TRY',
    telephone: contact.phoneE164,
    email: contact.email,
    address,
    areaServed: { '@type': 'City', name: contact.locality },
    acceptsReservations: reservationsUrl,
    image,
    logo: image,
    // Links the Restaurant to the Menu node emitted on the menu page, so a
    // crawler that only sees the homepage still knows a menu exists.
    hasMenu: { '@id': MENU_ID },
    /**
     * The chef is also the founder (see aboutContent.chef). `sameAs` is
     * omitted: no public profile of hers is confirmed in the repo, and
     * guessing one would merge her with the wrong person.
     */
    founder: {
      '@type': 'Person',
      '@id': CHEF_ID,
      name: aboutContent.chef.name,
      jobTitle: 'Chef',
    },
    employee: { '@id': CHEF_ID },
    /**
     * Lets assistants and Google offer "reserve a table" directly. Points at
     * the site's own request form, which is the only reservation channel —
     * there is no confirmed third-party booking integration.
     */
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: reservationsUrl,
        inLanguage: LANGUAGE_TAG[locale],
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      // No `name` here on purpose: it would have to be translated per locale
      // and the type already says what the action produces.
      result: { '@type': 'FoodEstablishmentReservation' },
    },
  };

  // Geo coordinates + map link — only when confirmed.
  if (geo.latitude !== null && geo.longitude !== null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }
  if (mapsUrl) schema.hasMap = mapsUrl;

  // Opening hours — only when confirmed (omitted while config.hours is null).
  // Uses schema.org DayOfWeek + opens/closes; an overnight close (e.g. 02:00)
  // is valid here.
  if (hours && hours.length > 0) {
    schema.openingHoursSpecification = hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    }));
  }

  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}

export function websiteSchema(locale: Locale = defaultLocale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: siteConfig.name,
    description: localizedDescription(locale),
    url: baseUrl,
    // Previously hard-coded to tr-TR, which told crawlers the English and
    // German pages were Turkish.
    inLanguage: LANGUAGE_TAG[locale],
    publisher: { '@id': RESTAURANT_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, baseUrl).toString(),
    })),
  };
}

/**
 * FAQPage schema. This is the highest-leverage markup on an editorial page:
 * Google AI Overviews, ChatGPT and Perplexity lift question/answer pairs
 * straight out of it, so every `answer` must stand on its own without the
 * surrounding prose.
 *
 * Google only honours one FAQPage per URL — never emit this twice on a page.
 */
export function faqSchema(items: readonly { question: string; answer: string }[]): Record<
  string,
  unknown
> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

interface ArticleSchemaInput {
  headline: string;
  description: string;
  /** Locale-correct path, e.g. '/kas-sef-restorani'. */
  path: string;
  /** ISO date (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date; falls back to `datePublished`. */
  dateModified?: string;
  inLanguage?: string;
}

/**
 * Article schema for long-form editorial pages.
 *
 * `about` points at the Restaurant node's `@id` rather than repeating its
 * fields, which tells crawlers the piece is about *this* business entity —
 * the disambiguation step that decides whether an assistant attributes the
 * content to Çi Neo Cucina or to Kaş in general.
 */
export function articleSchema({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  inLanguage = 'tr-TR',
}: ArticleSchemaInput): Record<string, unknown> {
  const url = new URL(path, baseUrl).toString();
  const image = new URL(siteConfig.ogDefaultImage, baseUrl).toString();
  const publisher = {
    '@type': 'Organization',
    name: siteConfig.name,
    url: baseUrl,
    logo: { '@type': 'ImageObject', url: image },
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage,
    datePublished,
    dateModified: dateModified ?? datePublished,
    image,
    author: publisher,
    publisher,
    about: { '@id': `${baseUrl}#restaurant` },
  };
}

/**
 * Menu schema.
 *
 * Carries the same `@id` in every locale and points back at the Restaurant
 * node, so the five localized menu pages describe one menu belonging to one
 * business instead of five unrelated Menu objects.
 */
export function menuSchema(
  categories: MenuCategory[],
  locale: Locale = defaultLocale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': MENU_ID,
    url: new URL(localePath('/menu', locale), baseUrl).toString(),
    inLanguage: LANGUAGE_TAG[locale],
    isPartOf: { '@id': RESTAURANT_ID },
    name: `${siteConfig.name} — Menü`,
    hasMenuSection: categories.map((category) => ({
      '@type': 'MenuSection',
      name: category.name,
      description: category.description ?? undefined,
      hasMenuItem: category.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description ?? undefined,
        offers:
          item.price !== null
            ? {
                '@type': 'Offer',
                price: item.price,
                priceCurrency: item.currency,
              }
            : undefined,
      })),
    })),
  };
}
