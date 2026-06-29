import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * Sitemap built from the known public routes. Legal pages are excluded
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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: new URL(route.path, base).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
