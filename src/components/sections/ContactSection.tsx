import { SectionHeading } from '@/components/ui/SectionHeading';
import { siteConfig } from '@/lib/site-config';

/**
 * Contact / location block. Renders the phone, email and region. The exact
 * street address, map and opening hours are not in the source data, so the
 * block invites guests to call for directions rather than showing placeholders.
 */
export function ContactSection({ withHeading = true }: { withHeading?: boolean }) {
  const { contact, hours } = siteConfig;

  return (
    <section id="contact" className="scroll-mt-24 bg-cream-deep py-section">
      <div className="container-editorial">
        {withHeading && (
          <SectionHeading eyebrow="Bize Ulaşın" title="İletişim & Konum" align="center" />
        )}

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-soft bg-marble p-7">
            <h3 className="font-display text-xl text-charcoal">İletişim</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col">
                <dt className="text-muted">Telefon</dt>
                <dd>
                  <a
                    href={`tel:${contact.phoneE164}`}
                    className="text-charcoal transition-colors hover:text-olive"
                  >
                    {contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted">E-posta</dt>
                <dd>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-charcoal transition-colors hover:text-olive"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-stone-soft bg-marble p-7">
            <h3 className="font-display text-xl text-charcoal">Konum</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {contact.region}.{' '}
              {contact.address ?? 'Tam adres ve yol tarifi için lütfen bizi arayın.'}
            </p>

            {hours ? (
              <ul className="mt-4 space-y-1 text-sm text-charcoal">
                {hours.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4">
                    <span>{row.label}</span>
                    <span className="text-muted">{row.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Güncel çalışma saatlerimiz için bizimle iletişime geçebilirsiniz.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
