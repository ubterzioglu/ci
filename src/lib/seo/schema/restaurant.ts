import { aboutContent } from '@/content/pages-data';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

import {
  baseUrl,
  CHEF_ID,
  LANGUAGE_TAG,
  localizedDescription,
  MENU_ID,
  RESTAURANT_ID,
} from './shared';

export function restaurantSchema(locale: Locale = defaultLocale): Record<string, unknown> {
  const { contact, geo, social, hours } = siteConfig;
  const mapsUrl =
    geo.latitude !== null && geo.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${geo.latitude},${geo.longitude}`
      : contact.mapsUrl;

  // PostalAddress — streetAddress only when a real address is known.
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressLocality: contact.locality,
    addressRegion: contact.administrativeArea,
    postalCode: contact.postalCode,
    addressCountry: contact.countryCode,
  };
  if (contact.address) address.streetAddress = contact.address;

  // Social/listing profiles for entity disambiguation (Google "sameAs").
  const sameAs = [
    social.instagram,
    social.facebook,
    social.tripadvisor,
    social.wanderlog,
    social.restaurantGuru,
    mapsUrl,
  ].filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  );

  const image = new URL(siteConfig.ogDefaultImage, baseUrl).toString();
  const reservationsUrl = new URL(localePath('/reservations', locale), baseUrl).toString();

  /**
   * `@id` and `url` stay on the unprefixed (Turkish) root in every locale:
   * this is ONE business, and emitting a per-locale id would split it into
   * five entities, which is exactly how a restaurant ends up with its hours
   * attached to one language and its address to another. Only the
   * human-readable fields follow the locale.
   */
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': RESTAURANT_ID,
    name: siteConfig.name,
    description: localizedDescription(locale),
    inLanguage: LANGUAGE_TAG[locale],
    url: baseUrl,
    servesCuisine: ['Mediterranean', 'Anatolian', 'Seafood'],
    priceRange: '₺₺₺',
    currenciesAccepted: 'TRY',
    telephone: contact.phoneE164,
    email: contact.email,
    address,
    areaServed: { '@type': 'City', name: contact.locality },
    acceptsReservations: reservationsUrl,
    image,
    logo: image,
    // Links the Restaurant to the Menu node emitted on the menu page, so a
    // crawler that only sees the homepage still knows a menu exists.
    hasMenu: { '@id': MENU_ID },
    /**
     * The chef is also the founder (see aboutContent.chef). `sameAs` is
     * omitted: no public profile of hers is confirmed in the repo, and
     * guessing one would merge her with the wrong person.
     */
    founder: {
      '@type': 'Person',
      '@id': CHEF_ID,
      name: aboutContent.chef.name,
      jobTitle: 'Chef',
    },
    employee: { '@id': CHEF_ID },
    /**
     * Lets assistants and Google offer "reserve a table" directly. Points at
     * the site's own request form, which is the only reservation channel —
     * there is no confirmed third-party booking integration.
     */
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: reservationsUrl,
        inLanguage: LANGUAGE_TAG[locale],
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      // No `name` here on purpose: it would have to be translated per locale
      // and the type already says what the action produces.
      result: { '@type': 'FoodEstablishmentReservation' },
    },
  };

  // Geo coordinates + map link — only when confirmed.
  if (geo.latitude !== null && geo.longitude !== null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }
  if (mapsUrl) schema.hasMap = mapsUrl;

  // Opening hours — only when confirmed (omitted while config.hours is null).
  // Uses schema.org DayOfWeek + opens/closes; an overnight close (e.g. 02:00)
  // is valid here.
  if (hours && hours.length > 0) {
    schema.openingHoursSpecification = hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    }));
  }

  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}
