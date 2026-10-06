import type { Metadata } from 'next';

import { MenuPageBody } from '@/components/pages/MenuPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/menu', 'tr');

export default function MenuPage() {
  return <MenuPageBody locale="tr" />;
}
