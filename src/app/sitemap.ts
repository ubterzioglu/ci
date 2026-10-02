import type { MetadataRoute } from 'next';

import { CHEF_RESTAURANT_DATES, CHEF_RESTAURANT_PATH } from '@/content/kas-sef-restorani';
import { defaultLocale, locales } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

/**
 * Sitemap built from the known public routes, one entry per locale. Each entry
 * carries `alternates.languages` (hreflang) listing every locale's URL so
 * crawlers understand the tr/en/de relationship. Legal pages are excluded
 * (noindex). If the page set becomes fully database-driven, derive the list
 * from getPublishedSlugs() instead.
 *
 * `lastModified` is stamped once at build time rather than per-request, so the
 * sitemap does not claim every page changed on every deploy (which dilutes the
 * signal for crawlers). Re-deploying refreshes it to the new build date.
 */

interface RouteConfig {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  /**
   * Real last-edit date, for pages that track one. Editorial pages should use
   * it instead of the build date: the Article JSON-LD already states a
   * `dateModified`, and a sitemap claiming a newer date contradicts it.
   */
  lastModified?: string;
}

const ROUTES: RouteConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/menu', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/reservations', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/experiences', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

/**
 * Turkish-only pages with no localized counterpart. Listed once, without
 * hreflang alternates — fanning them across locales would advertise /en/… and
 * /de/… URLs that 404.
 *
 * These pages are intentionally absent from `mainNav`, so the sitemap is the
 * only way a crawler learns they exist. Removing an entry here effectively
 * unpublishes the page.
 */
const TR_ONLY_ROUTES: RouteConfig[] = [
  {
    path: CHEF_RESTAURANT_PATH,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: CHEF_RESTAURANT_DATES.modified,
  },
];

const base = siteConfig.url;
const absolute = (path: string): string => new URL(path, base).toString();

/**
 * hreflang alternates for a route: one URL per locale + x-default.
 *
 * x-default is EN, not TR: it is what a visitor whose language matches no
 * hreflang gets, and most of those visitors in Kaş are foreign tourists.
 * Must stay in step with X_DEFAULT_LOCALE in lib/seo/metadata.ts — the sitemap
 * and the page's own <link rel="alternate"> contradicting each other is worse
 * than either choice.
 */
function languageAlternates(routePath: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absolute(localePath(routePath, locale));
  }
  languages['x-default'] = absolute(localePath(routePath, 'en'));
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const localized = ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: absolute(localePath(route.path, locale)),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    })),
  );

  const turkishOnly = TR_ONLY_ROUTES.map((route) => ({
    url: absolute(localePath(route.path, defaultLocale)),
    lastModified: route.lastModified ? new Date(route.lastModified) : lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...localized, ...turkishOnly];
}
