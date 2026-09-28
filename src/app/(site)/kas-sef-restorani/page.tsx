import type { Metadata } from 'next';

import { ChefRestaurantPageBody } from '@/components/pages/ChefRestaurantPageBody';
import { CHEF_RESTAURANT_PATH, chefRestaurantMeta } from '@/content/kas-sef-restorani';
import { buildMetadata } from '@/lib/seo/metadata';

/**
 * Editorial landing page written for organic and AI-assistant search.
 *
 * Intentionally NOT in `mainNav` — it appears in no header, footer or mobile
 * menu, and has no inbound internal links. Discovery runs entirely through the
 * sitemap entry in app/sitemap.ts; drop that entry and the page goes dark.
 *
 * Turkish only, hence `localeAlternates: false` — there is no /en or /de
 * counterpart to point hreflang at. Add one here (and a localized route) before
 * turning alternates back on.
 */
export const metadata: Metadata = buildMetadata({
  title: chefRestaurantMeta.seoTitle,
  description: chefRestaurantMeta.description,
  path: CHEF_RESTAURANT_PATH,
  localeAlternates: false,
});

export default function ChefRestaurantPage() {
  return <ChefRestaurantPageBody />;
}
