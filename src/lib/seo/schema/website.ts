import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/lib/site-config';

import { baseUrl, LANGUAGE_TAG, localizedDescription, RESTAURANT_ID } from './shared';

export function websiteSchema(locale: Locale = defaultLocale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    name: siteConfig.name,
    description: localizedDescription(locale),
    url: baseUrl,
    // Previously hard-coded to tr-TR, which told crawlers the English and
    // German pages were Turkish.
    inLanguage: LANGUAGE_TAG[locale],
    publisher: { '@id': RESTAURANT_ID },
  };
}
