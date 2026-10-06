import { siteConfig } from '@/lib/site-config';

import { baseUrl, RESTAURANT_ID, WEBSITE_ID } from './shared';

export interface WebPageSchemaInput {
  name: string;
  description: string;
  /** Locale-correct path, e.g. '/kas-sef-restorani'. */
  path: string;
  inLanguage?: string;
  /** ISO dates (YYYY-MM-DD). */
  datePublished?: string;
  dateModified?: string;
}

/** `@id` of the WebPage node for a given page URL. */
export function webPageId(url: string): string {
  return `${url}#webpage`;
}

/**
 * WebPage schema tying a page into the site-wide graph: it belongs to the
 * WebSite node, is about the Restaurant node, and points at the page's
 * Article and FAQPage nodes by `@id` (see articleSchema / faqSchema) instead
 * of repeating them.
 */
export function webPageSchema({
  name,
  description,
  path,
  inLanguage = 'tr-TR',
  datePublished,
  dateModified,
}: WebPageSchemaInput): Record<string, unknown> {
  const url = new URL(path, baseUrl).toString();
  const image = new URL(siteConfig.ogDefaultImage, baseUrl).toString();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': webPageId(url),
    url,
    name,
    description,
    inLanguage,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': RESTAURANT_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
    mainEntity: { '@id': `${url}#article` },
    hasPart: { '@id': `${url}#faq` },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ?? datePublished ? { dateModified: dateModified ?? datePublished } : {}),
  };
}
