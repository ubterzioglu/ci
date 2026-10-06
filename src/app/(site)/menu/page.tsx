import type { Metadata } from 'next';

import { MenuPageBody } from '@/components/pages/MenuPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/menu', 'tr');

// ISR — admin menu actions call revalidatePath('/menu') for instant updates.
export const revalidate = 60;

export default function MenuPage() {
  return <MenuPageBody locale="tr" />;
}
