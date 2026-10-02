import type { Metadata } from 'next';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';

export const metadata: Metadata = buildMetadata({
  absoluteTitle: seoTitle('/about', 'tr'),
  description:
    'Çi Neo Cucina’nın dinginlik, sürdürülebilirlik, yerel malzeme ve Akdeniz sofrası odaklı hikâyesi.',
  path: '/about',
});

export default function AboutPage() {
  return <AboutPageBody locale="tr" />;
}
