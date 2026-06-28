import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * Sitemap built from the known public routes. Legal pages are excluded
 * (noindex). If the page set becomes fully database-driven, derive the list
 * from getPublishedSlugs() instead.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const routes = ['/', '/menu', '/about', '/experiences', '/reservations', '/contact'];

  return routes.map((route) => ({
    url: new URL(route, base).toString(),
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/menu' ? 0.9 : 0.7,
  }));
}
