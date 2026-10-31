import { getHomeFaq } from '@/content/home-faq';
import { HOME_DATES } from '@/content/pages-data';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

/**
 * Bodies of the AI discovery files: /ai/summary.json, /ai/faq.json and
 * /.well-known/ai.txt.
 *
 * Like llms.txt (see llms-txt.ts) these are generated from siteConfig and the
 * home FAQ dictionary rather than hand-written, so the address, phone number,
 * hours and FAQ answers cannot drift from what the pages and JSON-LD state.
 * Nothing is asserted here that the site does not already say publicly.
 */

const abs = (path: string) => new URL(path, siteConfig.url).toString();

export const AI_SUMMARY_PATH = '/ai/summary.json';
export const AI_FAQ_PATH = '/ai/faq.json';
export const AI_TXT_PATH = '/.well-known/ai.txt';

export function buildAiSummary() {
  const { contact, hours, social } = siteConfig;
  const profiles = [social.instagram, social.tripadvisor, social.wanderlog, social.restaurantGuru];

  return {
    name: siteConfig.name,
    description: siteConfig.description,
    type: 'Restaurant',
    cuisine: ['Mediterranean', 'Anatolian'],
    url: abs('/'),
    languages: ['tr', 'en', 'de', 'ru', 'fr'],
    lastUpdated: HOME_DATES.modified,
    contact: {
      address: contact.address,
      phone: contact.phoneDisplay,
      email: contact.email,
      map: contact.mapsUrl,
    },
    openingHours: (hours ?? []).map((slot) => ({ days: slot.label, hours: slot.value })),
    reservations: abs(localePath('/reservations', 'en')),
    pages: {
      menu: abs(localePath('/menu', 'en')),
      about: abs(localePath('/about', 'en')),
      experiences: abs(localePath('/experiences', 'en')),
      contact: abs(localePath('/contact', 'en')),
    },
    faq: abs(AI_FAQ_PATH),
    service: abs('/ai/service.json'),
    llmsTxt: abs('/llms.txt'),
    llmsFullTxt: abs('/llms-full.txt'),
    profiles: profiles.filter((href): href is string => Boolean(href)),
  };
}

export function buildAiFaq() {
  return {
    name: siteConfig.name,
    url: abs('/'),
    lastUpdated: HOME_DATES.modified,
    // Flat Turkish list (the default language) for consumers that read `faqs`;
    // every language is under `faq`.
    faqs: getHomeFaq('tr'),
    faq: {
      tr: getHomeFaq('tr'),
      en: getHomeFaq('en'),
      de: getHomeFaq('de'),
      ru: getHomeFaq('ru'),
      fr: getHomeFaq('fr'),
    },
  };
}

/**
 * /ai/service.json — what the restaurant offers and how to engage it. Only
 * services the site already states publicly: no online instant booking, no
 * delivery, no unconfirmed extras.
 */
export function buildAiService() {
  const { contact } = siteConfig;

  return {
    name: siteConfig.name,
    url: abs('/'),
    capabilities: [
      {
        name: 'Dining',
        description:
          'Mediterranean and Anatolian restaurant in Kaş, Antalya with a seasonal, product-led menu and a wine selection from local producers.',
        url: abs(localePath('/menu', 'en')),
      },
      {
        name: "Chef's Table",
        description: 'A set-menu experience with the chef, offered by arrangement.',
        url: abs(localePath('/experiences', 'en')),
      },
      {
        name: 'Private events',
        description: 'Private events and set menus by arrangement; contact the restaurant.',
        url: abs(localePath('/contact', 'en')),
      },
    ],
    booking: {
      method: 'request',
      note: 'Reservations are requested through the website form or by phone; there is no online instant booking.',
      form: abs(localePath('/reservations', 'en')),
      phone: contact.phoneE164,
      email: contact.email,
    },
    location: { address: contact.address, map: contact.mapsUrl },
    lastUpdated: HOME_DATES.modified,
  };
}

/**
 * /.well-known/ai.txt — crawler permissions. Mirrors robots.ts: retrieval and
 * search bots (the ones that cite pages in answers) are explicitly allowed;
 * training bots are not restricted; only the private surfaces are off-limits.
 */
export function buildAiTxt(): string {
  return [
    `# AI crawler permissions for ${siteConfig.name}`,
    `# Mirrors ${abs('/robots.txt')}`,
    '',
    'User-Agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /admin/',
    '',
    '# Retrieval / answer-engine crawlers: allowed, citation welcome.',
    'User-Agent: OAI-SearchBot',
    'User-Agent: ChatGPT-User',
    'User-Agent: PerplexityBot',
    'User-Agent: Perplexity-User',
    'User-Agent: Claude-SearchBot',
    'User-Agent: Claude-User',
    'User-Agent: Googlebot',
    'User-Agent: Applebot',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /admin/',
    '',
    `Summary: ${abs(AI_SUMMARY_PATH)}`,
    `FAQ: ${abs(AI_FAQ_PATH)}`,
    `Service: ${abs('/ai/service.json')}`,
    `LLMs: ${abs('/llms.txt')}`,
    `Contact: ${siteConfig.contact.email}`,
    '',
  ].join('\n');
}
