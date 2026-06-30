import type { Metadata } from 'next';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Hakkımızda',
  description:
    'Çi Neo Cucina’nın dinginlik, sürdürülebilirlik, yerel malzeme ve Akdeniz sofrası odaklı hikâyesi.',
  path: '/about',
});

export default function AboutPage() {
  return <AboutPageBody locale="tr" />;
}
