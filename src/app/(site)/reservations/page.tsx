import type { Metadata } from 'next';

import { ReservationsPageBody } from '@/components/pages/ReservationsPageBody';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata('/reservations', 'tr');

export default function ReservationsPage() {
  return <ReservationsPageBody locale="tr" />;
}
