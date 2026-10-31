import {
  CHEF_RESTAURANT_DATES,
  CHEF_RESTAURANT_PATH,
  chefRestaurantMeta,
} from '@/content/kas-sef-restorani';
import { HOME_DATES } from '@/content/pages-data';
import { siteConfig } from '@/lib/site-config';

/**
 * Body of /feed.xml — an Atom feed of the site's editorial pages.
 *
 * The site has no blog, so the feed lists only pages that carry a real
 * published/modified date (the same constants the JSON-LD and sitemap use).
 * It grows when new editorial pages are added here; nothing is invented.
 */

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (path: string): string => new URL(path, siteConfig.url).toString();
const stamp = (date: string): string => `${date}T00:00:00Z`;

interface FeedEntry {
  title: string;
  path: string;
  summary: string;
  published: string;
  modified: string;
}

export function buildAtomFeed(): string {
  const entries: FeedEntry[] = [
    {
      title: chefRestaurantMeta.title,
      path: CHEF_RESTAURANT_PATH,
      summary: chefRestaurantMeta.description,
      published: CHEF_RESTAURANT_DATES.published,
      modified: CHEF_RESTAURANT_DATES.modified,
    },
    {
      title: siteConfig.name,
      path: '/',
      summary: siteConfig.description,
      published: HOME_DATES.published,
      modified: HOME_DATES.modified,
    },
  ].sort((a, b) => b.modified.localeCompare(a.modified));

  const updated = entries[0]?.modified ?? HOME_DATES.modified;

  const items = entries.map(
    (entry) => `  <entry>
    <title>${escape(entry.title)}</title>
    <link href="${escape(abs(entry.path))}"/>
    <id>${escape(abs(entry.path))}</id>
    <published>${stamp(entry.published)}</published>
    <updated>${stamp(entry.modified)}</updated>
    <summary>${escape(entry.summary)}</summary>
  </entry>`,
  );

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="tr">
  <title>${escape(siteConfig.name)}</title>
  <subtitle>${escape(siteConfig.description)}</subtitle>
  <link href="${escape(abs('/feed.xml'))}" rel="self" type="application/atom+xml"/>
  <link href="${escape(abs('/'))}"/>
  <id>${escape(abs('/'))}</id>
  <updated>${stamp(updated)}</updated>
${items.join('\n')}
</feed>
`;
}
