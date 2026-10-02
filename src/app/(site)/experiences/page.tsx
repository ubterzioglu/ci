import type { Metadata } from 'next';

import { ExperiencesPageBody } from '@/components/pages/ExperiencesPageBody';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';

export const metadata: Metadata = buildMetadata({
  absoluteTitle: seoTitle('/experiences', 'tr'),
  description: 'Çi Neo Cucina deneyimleri, Chef’s Table ve özel etkinlikler — talebe göre.',
  path: '/experiences',
});

export default function ExperiencesPage() {
  return <ExperiencesPageBody locale="tr" />;
}
