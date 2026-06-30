import type { Metadata } from 'next';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  // Homepage uses the brand name as-is (no "| Çi Neo Cucina" suffix); the
  // canonical points at the site root.
  path: '/',
});

export default function HomePage() {
  return <HomePageBody locale="tr" />;
}
