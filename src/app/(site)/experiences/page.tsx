import type { Metadata } from 'next';

import { ExperiencesPageBody } from '@/components/pages/ExperiencesPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/experiences', 'tr');

export const revalidate = 60;

export default function ExperiencesPage() {
  return <ExperiencesPageBody locale="tr" />;
}
