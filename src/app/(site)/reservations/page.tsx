import type { Metadata } from 'next';

import { ReservationsPageBody } from '@/components/pages/ReservationsPageBody';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';

export const metadata: Metadata = buildMetadata({
  absoluteTitle: seoTitle('/reservations', 'tr'),
  description:
    'Çi Neo Cucina’da rezervasyon talebi oluşturun; kişi sayısı, tarih ve saat bilgilerinizi paylaşın.',
  path: '/reservations',
});

export default function ReservationsPage() {
  return <ReservationsPageBody locale="tr" />;
}
