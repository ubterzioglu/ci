import { siteConfig } from '@/lib/site-config';

import { baseUrl } from './shared';
import { webPageId } from './webpage';

export interface ArticleSchemaInput {
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
    mainEntityOfPage: { '@type': 'WebPage', '@id': webPageId(url) },
    inLanguage,
    datePublished,
    dateModified: dateModified ?? datePublished,
    image,
    author: publisher,
    publisher,
    about: { '@id': `${baseUrl}#restaurant` },
  };
}
