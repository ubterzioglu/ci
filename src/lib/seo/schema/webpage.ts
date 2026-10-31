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
  /** Emit `mainEntity: <url>#article` — only for pages that carry an Article node. */
  hasArticle?: boolean;
  /** Emit `hasPart: <url>#faq` — only for pages that carry a FAQPage node. */
  hasFaq?: boolean;
  /** Emit a SpeakableSpecification pointing at the page's visible H1. */
  speakable?: boolean;
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
  hasArticle = false,
  hasFaq = false,
  speakable = false,
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
    ...(hasArticle ? { mainEntity: { '@id': `${url}#article` } } : {}),
    ...(hasFaq ? { hasPart: { '@id': `${url}#faq` } } : {}),
    ...(speakable ? { speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] } } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...((dateModified ?? datePublished) ? { dateModified: dateModified ?? datePublished } : {}),
  };
}
