import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/layout/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = buildMetadata({
  title: 'Deneyimler',
  description: 'Çi Neo Cucina deneyimleri, Chef’s Table ve özel etkinlikler — talebe göre.',
  path: '/experiences',
});

/**
 * The source page is an empty "coming soon" state. We turn it into a tasteful
 * "experiences by request" page with a clear path to contact / reserve, rather
 * than inventing experiences that do not exist.
 */
export default function ExperiencesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Deneyimler', path: '/experiences' },
        ])}
      />

      <PageHeader
        eyebrow="Çi Neo Cucina"
        title="Deneyimler"
        intro="Şu an için takvimimizde yayında olan özel bir deneyim bulunmuyor. Chef’s Table ve özel etkinlikleri talebe göre hazırlıyoruz."
      />

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="border-stone-soft bg-cream-deep/40 mx-auto max-w-2xl rounded-lg border p-8 text-center md:p-12">
            <p className="font-display text-charcoal text-2xl">
              Sizin için özel bir akşam tasarlayalım
            </p>
            <p className="text-muted mx-auto mt-4 max-w-xl leading-relaxed">
              Chef’s Table, özel menüler ve kapalı etkinlikler için ekibimizle iletişime geçin.{' '}
              {siteConfig.reservationNote}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="bg-olive text-ivory hover:bg-olive-deep rounded-md px-6 py-3 transition-colors"
              >
                İletişime Geç
              </Link>
              <Link
                href={PRIMARY_CTA.href}
                className="border-olive text-olive hover:bg-olive hover:text-ivory rounded-md border px-6 py-3 transition-colors"
              >
                {PRIMARY_CTA.labelTr}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
