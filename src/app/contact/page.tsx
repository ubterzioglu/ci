import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { ContactForm } from '@/components/forms/ContactForm';
import { ContactSection } from '@/components/sections/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = buildMetadata({
  title: 'İletişim',
  description:
    'Çi Neo Cucina ile iletişime geçin: rezervasyon, özel etkinlik ve sorularınız için bize ulaşın.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'İletişim', path: '/contact' },
        ])}
      />

      <PageHeader
        eyebrow="Bize Yazın"
        title="İletişim"
        intro="Sorularınız, özel etkinlik talepleriniz veya geri bildirimleriniz için bize mesaj bırakın."
      />

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="mx-auto max-w-2xl rounded-lg border border-stone-soft bg-cream-deep/40 p-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <ContactSection withHeading />
    </>
  );
}
