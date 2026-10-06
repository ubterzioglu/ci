import type { Metadata } from 'next';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/', 'tr');

export default function HomePage() {
  return <HomePageBody locale="tr" />;
}
