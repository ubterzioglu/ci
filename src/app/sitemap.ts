import type { MetadataRoute } from 'next';

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
}

const ROUTES: RouteConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/menu', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/reservations', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/experiences', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

const base = siteConfig.url;
const absolute = (path: string): string => new URL(path, base).toString();

/** hreflang alternates for a route: one URL per locale + x-default (TR). */
function languageAlternates(routePath: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absolute(localePath(routePath, locale));
  }
  languages['x-default'] = absolute(localePath(routePath, defaultLocale));
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: absolute(localePath(route.path, locale)),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    })),
  );
}
