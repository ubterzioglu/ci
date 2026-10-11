import { CHEF_RESTAURANT_PATH } from '@/content/kas-sef-restorani';
import { aboutContent, HOME_DATES } from '@/content/pages-data';
import { localePath } from '@/lib/i18n/paths';
import { siteConfig } from '@/lib/site-config';

/**
 * Body of /llms.txt — a plain-text brief for AI assistants.
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
 *
 * Pages and profiles are written as markdown links (`[label](url)`), as the
 * llms.txt proposal specifies — bare URLs are not picked up as links.
 */
export function buildLlmsTxt(): string {
  const { contact, hours, social } = siteConfig;
  const base = siteConfig.url;
  const url = (path: string, locale: 'tr' | 'en' = 'tr') =>
    new URL(localePath(path, locale), base).toString();
  const page = (label: string, path: string) =>
    `- [${label} (TR)](${url(path)}) — also [EN](${url(path, 'en')})`;

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
    `Last updated: ${HOME_DATES.modified}`,
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
  if (contact.mapsUrl) lines.push(`- Map: [Google Maps](${contact.mapsUrl})`);

  lines.push(
    '',
    '## Pages',
    '',
    `- [Home (TR)](${url('/')}) — also [EN](${url('/', 'en')})`,
    page('Menu', '/menu'),
    page('About the restaurant and the chef', '/about'),
    page("Experiences / Chef's Table", '/experiences'),
    page('Reservation request', '/reservations'),
    page('Contact and directions', '/contact'),
    `- [Editorial: looking for a chef-led restaurant in Kaş (TR)](${url(CHEF_RESTAURANT_PATH)})`,
    '',
    '## Languages',
    '',
    'The site is published in Turkish (default, unprefixed URLs), English (/en),',
    'German (/de), Russian (/ru) and French (/fr).',
    '',
  );

  const profiles: [string, string | null][] = [
    ['Instagram', social.instagram],
    ['Tripadvisor', social.tripadvisor],
    ['Wanderlog', social.wanderlog],
    ['Restaurant Guru', social.restaurantGuru],
  ];
  const listed = profiles.filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (listed.length > 0) {
    lines.push('## Profiles', '', ...listed.map(([label, href]) => `- [${label}](${href})`), '');
  }

  return lines.join('\n');
}
