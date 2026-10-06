import type { Metadata } from 'next';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/', 'tr');

// ISR — revalidate every 60s as a safety net. Admin actions call
// revalidatePath('/') for instant updates when content changes.
export const revalidate = 60;

export default function HomePage() {
  return <HomePageBody locale="tr" />;
}
