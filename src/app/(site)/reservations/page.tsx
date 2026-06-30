import type { Metadata } from 'next';

import { ReservationsPageBody } from '@/components/pages/ReservationsPageBody';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Rezervasyonlar',
  description:
    'Çi Neo Cucina’da rezervasyon talebi oluşturun; kişi sayısı, tarih ve saat bilgilerinizi paylaşın.',
  path: '/reservations',
});

export default function ReservationsPage() {
  return <ReservationsPageBody locale="tr" />;
}
