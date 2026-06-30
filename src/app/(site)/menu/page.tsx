import type { Metadata } from 'next';

import { MenuPageBody } from '@/components/pages/MenuPageBody';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Menü',
  description:
    'Çi Neo Cucina ana menüsü: topraktan, denizden ve otlaktan lezzetler; yerel üreticilerden şarap seçkisi.',
  path: '/menu',
});

export default function MenuPage() {
  return <MenuPageBody locale="tr" />;
}
