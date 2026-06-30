import { PageHeader } from '@/components/layout/PageHeader';
import { ContactForm } from '@/components/forms/ContactForm';
import { ContactSection } from '@/components/sections/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/schema';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface ContactPageBodyProps {
  locale: Locale;
}

/**
 * Shared contact-page body for both the TR and the EN/DE routes. Breadcrumb
 * labels come from the dictionary; breadcrumb paths are locale-prefixed. The
 * locale threads into the shared ContactSection so its labels localize. The
 * contact form itself is TR-only for now (no locale seam wired into the form
 * component yet).
 */
export function ContactPageBody({ locale }: ContactPageBodyProps) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.contact, path: localePath('/contact', locale) },
        ])}
      />

      <PageHeader
        eyebrow="Bize Yazın"
        title="İletişim"
        intro="Sorularınız, özel etkinlik talepleriniz veya geri bildirimleriniz için bize mesaj bırakın."
      />

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="border-stone-soft bg-cream-deep/40 mx-auto max-w-2xl rounded-lg border p-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <ContactSection withHeading locale={locale} />
    </>
  );
}

export default ContactPageBody;
