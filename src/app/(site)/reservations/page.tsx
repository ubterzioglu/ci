import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = buildMetadata({
  title: 'Rezervasyonlar',
  description:
    'Çi Neo Cucina’da rezervasyon talebi oluşturun; kişi sayısı, tarih ve saat bilgilerinizi paylaşın.',
  path: '/reservations',
});

export default function ReservationsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Rezervasyonlar', path: '/reservations' },
        ])}
      />

      <PageHeader
        eyebrow="Masanızı Ayırtın"
        title="Rezervasyon Talep Edin"
        intro="Ayrıntıları paylaşın; sizin için en uygun yeri bulmaya çalışalım. Talebinizi aldıktan sonra en kısa sürede sizinle iletişime geçeceğiz."
      />

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="border-stone-soft bg-cream-deep/40 mx-auto max-w-2xl rounded-lg border p-6 md:p-10">
            <ReservationForm />
          </div>

          <p className="text-muted mx-auto mt-8 max-w-2xl text-center text-sm">
            Büyük gruplar ve özel etkinlikler için{' '}
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className="text-olive underline-offset-4 hover:underline"
            >
              {siteConfig.contact.phoneDisplay}
            </a>{' '}
            numarasından bize ulaşabilirsiniz.
          </p>
        </div>
      </section>
    </>
  );
}
