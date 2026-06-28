import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = buildMetadata({
  title: 'Gizlilik Politikası',
  description: 'Çi Neo Cucina gizlilik ve kişisel verilerin korunması bilgilendirmesi.',
  path: '/datenschutz',
  noIndex: true,
});

/**
 * Privacy policy placeholder. No legal text was present in the source export.
 * We describe the data we actually collect (reservation + contact form fields)
 * in plain language and flag that the formal policy is being prepared.
 * TODO(panel-export): add the official privacy / KVKK / GDPR text (see TODO_PANEL_EXPORTS.md).
 */
export default function DatenschutzPage() {
  return (
    <>
      <PageHeader eyebrow="Yasal" title="Gizlilik Politikası" />

      <section className="bg-marble pb-section">
        <div className="container-editorial text-charcoal/90 mx-auto max-w-2xl space-y-6">
          <p>
            Bu sayfa hazırlanmaktadır. Resmi gizlilik politikamız en kısa sürede burada
            yayınlanacaktır. Bu süre zarfında, web sitemiz üzerinden topladığımız verileri
            şeffaflıkla özetliyoruz.
          </p>

          <div className="border-stone-soft bg-cream-deep/40 rounded-lg border p-6">
            <h2 className="font-display text-charcoal text-xl">Topladığımız bilgiler</h2>
            <ul className="text-muted mt-3 list-inside list-disc space-y-1 text-sm">
              <li>Rezervasyon talebi: ad, e-posta/telefon, kişi sayısı, tarih, saat ve notunuz.</li>
              <li>İletişim formu: ad, e-posta/telefon, konu ve mesajınız.</li>
            </ul>
            <p className="text-muted mt-4 text-sm">
              Bu bilgileri yalnızca talebinizi yanıtlamak için kullanırız; üçüncü taraflarla
              pazarlama amacıyla paylaşmayız.
            </p>
          </div>

          <p className="text-muted text-sm">
            Verilerinizle ilgili her türlü soru için{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-olive hover:underline">
              {siteConfig.contact.email}
            </a>{' '}
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </section>
    </>
  );
}
