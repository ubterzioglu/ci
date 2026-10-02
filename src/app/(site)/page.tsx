import type { Metadata } from 'next';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';

export const metadata: Metadata = buildMetadata({
  // The homepage title is the one that has to win "Kaş restoran", so it is
  // written out in full (brand + location + cuisine) rather than assembled
  // from the brand name alone. Canonical points at the site root.
  absoluteTitle: seoTitle('/', 'tr'),
  path: '/',
});

export default function HomePage() {
  return <HomePageBody locale="tr" />;
}
