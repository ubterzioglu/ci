import type { Metadata } from 'next';

import { getLocalPage } from '@/content/pages-i18n';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

import { buildMetadata } from './metadata';
import { seoTitle, type TitledRoute } from './titles';

/**
 * Maps public route paths to their seedPages slug. The slug is the key used by
 * `getLocalPage` to look up per-locale content (seoDescription, excerpt).
 */
const ROUTE_TO_SLUG: Record<TitledRoute, string> = {
  '/': 'home',
  '/menu': 'menu',
  '/about': 'about',
  '/experiences': 'experiences',
  '/contact': 'contact',
  '/reservations': 'reservations',
};

/**
 * Single entry point for public-page metadata. Wraps `buildMetadata` +
 * `seoTitle` + per-locale content lookup so the 12 page files (6 TR + 6 [lang])
 * no longer repeat the same three imports and call shape.
 *
 * Output is byte-identical to the previous per-file calls: the absolute title
 * comes from the per-locale table in titles.ts, the description from the
 * seedPages seoDescription (TR) or its locale overlay, and buildMetadata
 * derives canonical + hreflang from the unprefixed path + locale.
 */
export function buildPageMetadata(route: TitledRoute, locale: Locale = defaultLocale): Metadata {
  const slug = ROUTE_TO_SLUG[route];
  const page = getLocalPage(slug, locale);

  return buildMetadata({
    absoluteTitle: seoTitle(route, locale),
    description: page?.seoDescription ?? page?.excerpt ?? undefined,
    path: route,
    locale,
  });
}
