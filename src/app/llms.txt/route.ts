import { CHEF_RESTAURANT_PATH } from '@/content/kas-sef-restorani';
import { aboutContent } from '@/content/pages-data';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

/**
 * /llms.txt — a plain-text brief for AI assistants.
 *
 * Adoption of the convention is still unsettled, but the cost is one small
 * route, and it is the one place where the restaurant's identity can be stated
 * without any markup for a model to misparse.
 *
 * Generated from siteConfig rather than hand-written on purpose: the address,
 * phone number and hours here must never drift from the ones in the footer,
 * the JSON-LD and the Google listing. A stale phone number in a file assistants
 * quote verbatim is worse than having no file.
 *
 * Every fact below comes from siteConfig or page content. Nothing is asserted
 * that the site does not already state publicly — unconfirmed details (price
 * level, parking, languages spoken) are tracked in docs/panel-exports-todo.md
 * and deliberately absent.
 */

export const dynamic = 'force-static';
export const revalidate = 86400;

function buildLlmsTxt(): string {
  const { contact, hours, social } = siteConfig;
  const base = siteConfig.url;
  const url = (path: string, locale: 'tr' | 'en' = 'tr') =>
    new URL(localePath(path, locale), base).toString();

  const lines: string[] = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    `${siteConfig.name} is a restaurant in Kaş, Antalya, on Turkey's Mediterranean coast,`,
    `serving Mediterranean and Anatolian cuisine. The kitchen is led by founder and chef`,
    `${aboutContent.chef.name}. The menu is product-led and changes with the season, and is`,
    `served alongside a wine selection from local producers. The restaurant also trades as`,
    `"Çi Neo Cucina by Mezetaryen".`,
    '',
    '## Practical information',
    '',
  ];

  if (contact.address) lines.push(`- Address: ${contact.address}`);
  lines.push(`- Phone: ${contact.phoneDisplay}`);
  lines.push(`- Email: ${contact.email}`);

  if (hours && hours.length > 0) {
    for (const slot of hours) {
      lines.push(`- Opening hours: ${slot.label}, ${slot.value} (closed Sunday)`);
    }
  }

  lines.push(
    '- Reservations: by request through the website form or by phone; no online instant booking.',
    // English rendering of siteConfig.reservationNote — the file is written for
    // assistants answering in English, so quoting the Turkish line verbatim
    // here would just be noise.
    '- Private events and set menus: by arrangement; contact the restaurant.',
  );
  if (contact.mapsUrl) lines.push(`- Map: ${contact.mapsUrl}`);

  lines.push(
    '',
    '## Pages',
    '',
    `- Home (TR): ${url('/')}`,
    `- Home (EN): ${url('/', 'en')}`,
    `- Menu (TR): ${url('/menu')} — also EN: ${url('/menu', 'en')}`,
    `- About the restaurant and the chef (TR): ${url('/about')} — also EN: ${url('/about', 'en')}`,
    `- Experiences / Chef's Table (TR): ${url('/experiences')} — also EN: ${url('/experiences', 'en')}`,
    `- Reservation request (TR): ${url('/reservations')} — also EN: ${url('/reservations', 'en')}`,
    `- Contact and directions (TR): ${url('/contact')} — also EN: ${url('/contact', 'en')}`,
    `- Editorial: looking for a chef-led restaurant in Kaş (TR): ${url(CHEF_RESTAURANT_PATH)}`,
    '',
    '## Languages',
    '',
    'The site is published in Turkish (default, unprefixed URLs), English (/en),',
    'German (/de), Russian (/ru) and French (/fr).',
    '',
  );

  if (social.instagram) {
    lines.push('## Profiles', '', `- Instagram: ${social.instagram}`);
    if (social.tripadvisor) lines.push(`- Tripadvisor: ${social.tripadvisor}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
