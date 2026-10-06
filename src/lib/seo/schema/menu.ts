import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';
import type { MenuCategory } from '@/lib/types';

import { baseUrl, LANGUAGE_TAG, MENU_ID, RESTAURANT_ID } from './shared';

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
