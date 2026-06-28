import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { buildMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = buildMetadata({
  title: 'İmpressum',
  description: 'Çi Neo Cucina yasal bilgilendirme ve künye.',
  path: '/impressum',
  noIndex: true,
});

/**
 * Legal imprint placeholder. The source site did not include legal text, so we
 * show the known contact details and a clear note that full legal information
 * is being prepared. Replace with the official text when provided.
 * TODO(panel-export): add official Impressum / company details (see TODO_PANEL_EXPORTS.md).
 */
export default function ImpressumPage() {
  const { contact } = siteConfig;

  return (
    <>
      <PageHeader eyebrow="Yasal" title="İmpressum" />

      <section className="bg-marble pb-section">
        <div className="container-editorial mx-auto max-w-2xl">
          <div className="space-y-6 text-charcoal/90">
            <p>
              Bu sayfa hazırlanmaktadır. Aşağıda güncel iletişim bilgilerimizi
              bulabilirsiniz; resmi künye bilgileri en kısa sürede eklenecektir.
            </p>

            <div className="rounded-lg border border-stone-soft bg-cream-deep/40 p-6">
              <h2 className="font-display text-xl text-charcoal">{siteConfig.name}</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>{contact.region}</li>
                <li>
                  Telefon:{' '}
                  <a href={`tel:${contact.phoneE164}`} className="text-olive hover:underline">
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  E-posta:{' '}
                  <a href={`mailto:${contact.email}`} className="text-olive hover:underline">
                    {contact.email}
                  </a>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted">
              Resmi ticari unvan, vergi bilgileri ve sorumlu kişi bilgileri için lütfen
              bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
