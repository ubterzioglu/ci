import type { Metadata } from 'next';

import { ContactPageBody } from '@/components/pages/ContactPageBody';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'İletişim',
  description:
    'Çi Neo Cucina ile iletişime geçin: rezervasyon, özel etkinlik ve sorularınız için bize ulaşın.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactPageBody locale="tr" />;
}
