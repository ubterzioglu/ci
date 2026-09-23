import { PageHeader } from '@/components/layout/PageHeader';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface ReservationsPageBodyProps {
  locale: Locale;
}

/**
 * Shared reservations-page body for both the TR and the EN/DE routes.
 * Breadcrumb labels come from the dictionary; breadcrumb paths are
 * locale-prefixed. The reservation form itself is TR-only for now (no locale
 * seam wired into the form component yet).
 */
export function ReservationsPageBody({ locale }: ReservationsPageBodyProps) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.reservations, path: localePath('/reservations', locale) },
        ])}
      />

      <PageHeader
        eyebrow={dictionary.pages.reservations.eyebrow}
        title={dictionary.pages.reservations.title}
        intro={dictionary.pages.reservations.intro}
      />

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="border-stone-soft bg-cream-deep/40 mx-auto max-w-2xl rounded-lg border p-6 md:p-8">
            <ReservationForm locale={locale} />
          </div>

          <p className="text-muted mx-auto mt-6 max-w-2xl text-center text-sm">
            {dictionary.pages.reservations.largeGroupsPrefix}{' '}
            <a
              href={`tel:${siteConfig.contact.phoneE164}`}
              className="text-olive underline-offset-4 hover:underline"
            >
              {siteConfig.contact.phoneDisplay}
            </a>{' '}
            {dictionary.pages.reservations.largeGroupsSuffix}
          </p>
        </div>
      </section>
    </>
  );
}

export default ReservationsPageBody;
