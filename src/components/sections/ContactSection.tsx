import { SectionHeading } from '@/components/ui/SectionHeading';
import { siteConfig } from '@/lib/site-config';
import { RESERVATION_RULE_LINES } from '@/lib/reservation-rules';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface ContactSectionProps {
  withHeading?: boolean;
  locale?: Locale;
}

/**
 * Contact / location block. Renders the phone, email and region. The exact
 * street address, map and opening hours are not in the source data, so the
 * block invites guests to call for directions rather than showing placeholders.
 */
export function ContactSection({
  withHeading = true,
  locale = defaultLocale,
}: ContactSectionProps) {
  const { contact, hours } = siteConfig;
  const dictionary = getDictionary(locale);

  return (
    <section id="contact" className="bg-cream-deep py-section scroll-mt-24">
      <div className="container-editorial">
        {withHeading && (
          <SectionHeading eyebrow="Bize Ulaşın" title="İletişim & Konum" align="center" />
        )}

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
          <div className="border-stone-soft bg-marble rounded-lg border p-7">
            <h3 className="font-display text-charcoal text-xl">İletişim</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col">
                <dt className="text-muted">{dictionary.common.phone}</dt>
                <dd>
                  <a
                    href={`tel:${contact.phoneE164}`}
                    className="text-charcoal hover:text-olive transition-colors"
                  >
                    {contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted">{dictionary.common.email}</dt>
                <dd>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-charcoal hover:text-olive transition-colors"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-stone-soft bg-marble rounded-lg border p-7">
            <h3 className="font-display text-charcoal text-xl">Konum</h3>
            <p className="text-muted mt-4 text-sm leading-relaxed">
              {contact.region}.{' '}
              {contact.address ?? 'Tam adres ve yol tarifi için lütfen bizi arayın.'}
            </p>

            {hours ? (
              <ul className="text-charcoal mt-4 space-y-1 text-sm">
                {hours.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4">
                    <span>{row.label}</span>
                    <span className="text-muted">{row.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mt-4 text-sm">
                Güncel çalışma saatlerimiz için bizimle iletişime geçebilirsiniz.
              </p>
            )}

            {/* The booking rules live beside the hours because that is where a
                guest looks before picking up the phone. Same source as the
                reservation form, so the two can never say different things. */}
            <div className="border-stone-soft mt-5 border-t pt-4">
              <h4 className="font-body text-charcoal text-sm font-semibold">Rezervasyon</h4>
              <ul className="text-muted mt-2 space-y-1 text-sm leading-relaxed">
                {RESERVATION_RULE_LINES.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
