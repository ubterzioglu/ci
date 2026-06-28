import { siteConfig } from '@/lib/site-config';
import type { MenuCategory } from '@/lib/types';

/**
 * JSON-LD structured data builders. Each returns a plain object that is
 * embedded via a <script type="application/ld+json"> tag.
 *
 * Facts that are not present in the source (street address, opening hours)
 * are intentionally omitted rather than fabricated. See TODO_PANEL_EXPORTS.md.
 */

const baseUrl = siteConfig.url;

export function restaurantSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    servesCuisine: ['Mediterranean', 'Anatolian', 'Seafood'],
    priceRange: '₺₺₺',
    telephone: siteConfig.contact.phoneE164,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kaş',
      addressRegion: 'Antalya',
      addressCountry: 'TR',
    },
    acceptsReservations: `${baseUrl}/reservations`,
    image: `${baseUrl}/og-default.jpg`,
  };
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

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Record<string, unknown> {
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
