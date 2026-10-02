import type { Metadata } from 'next';

import { ContactPageBody } from '@/components/pages/ContactPageBody';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';

export const metadata: Metadata = buildMetadata({
  absoluteTitle: seoTitle('/contact', 'tr'),
  description:
    'Çi Neo Cucina ile iletişime geçin: rezervasyon, özel etkinlik ve sorularınız için bize ulaşın.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactPageBody locale="tr" />;
}
