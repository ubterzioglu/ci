import { JsonLd } from '@/components/seo/JsonLd';
import { INNER_PAGE_DATES } from '@/content/pages-data';
import { getLocalPage } from '@/content/pages-i18n';
import type { Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';
import { webPageSchema } from '@/lib/seo/schema';
import { LANGUAGE_TAG } from '@/lib/seo/schema/shared';
import { seoTitle, type TitledRoute } from '@/lib/seo/titles';
import { siteConfig } from '@/lib/site-config';

const ROUTE_TO_SLUG: Record<Exclude<TitledRoute, '/'>, string> = {
  '/menu': 'menu',
  '/about': 'about',
  '/experiences': 'experiences',
  '/contact': 'contact',
  '/reservations': 'reservations',
};

interface PageSchemaProps {
  route: Exclude<TitledRoute, '/'>;
  locale: Locale;
}

/**
 * WebPage JSON-LD for the inner pages: ties the page into the site graph with
 * honest published/modified dates (see INNER_PAGE_DATES) and a speakable H1.
 * The home page builds its own node in HomePageBody because it also owns the
 * FAQ and Restaurant nodes.
 */
export function PageSchema({ route, locale }: PageSchemaProps) {
  const page = getLocalPage(ROUTE_TO_SLUG[route], locale);

  return (
    <JsonLd
      data={webPageSchema({
        name: seoTitle(route, locale),
        description: page?.seoDescription ?? siteConfig.description,
        path: localePath(route, locale),
        inLanguage: LANGUAGE_TAG[locale],
        datePublished: INNER_PAGE_DATES.published,
        dateModified: INNER_PAGE_DATES.modified,
        speakable: true,
      })}
    />
  );
}

export default PageSchema;
