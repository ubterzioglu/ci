import type { Metadata } from 'next';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/about', 'tr');

// ISR — admin team actions call revalidatePath('/about') for instant updates.
export const revalidate = 60;

export default function AboutPage() {
  return <AboutPageBody locale="tr" />;
}
