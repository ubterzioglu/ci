import { siteConfig } from '@/lib/site-config';
import type { MenuCategory } from '@/lib/types';

/**
 * JSON-LD structured data builders. Each returns a plain object that is
 * embedded via a <script type="application/ld+json"> tag.
 */

const baseUrl = siteConfig.url;

export function restaurantSchema(): Record<string, unknown> {
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

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${baseUrl}#restaurant`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    servesCuisine: ['Mediterranean', 'Anatolian', 'Seafood'],
    priceRange: '₺₺₺',
    currenciesAccepted: 'TRY',
    telephone: contact.phoneE164,
    email: contact.email,
    address,
    areaServed: { '@type': 'City', name: contact.locality },
    acceptsReservations: `${baseUrl}/reservations`,
    image: new URL(siteConfig.ogDefaultImage, baseUrl).toString(),
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

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: baseUrl,
    inLanguage: 'tr-TR',
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

export function menuSchema(categories: MenuCategory[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
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
