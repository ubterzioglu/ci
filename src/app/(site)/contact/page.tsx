import type { Metadata } from 'next';

import { ContactPageBody } from '@/components/pages/ContactPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/contact', 'tr');

export const revalidate = 60;

export default function ContactPage() {
  return <ContactPageBody locale="tr" />;
}
