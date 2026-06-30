import Link from 'next/link';

import { PageHeader } from '@/components/layout/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/schema';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface ExperiencesPageBodyProps {
  locale: Locale;
}

/**
 * Shared experiences-page body for both the TR and the EN/DE routes.
 *
 * The source page is an empty "coming soon" state. We turn it into a tasteful
 * "experiences by request" page with a clear path to contact / reserve, rather
 * than inventing experiences that do not exist. Breadcrumb labels come from the
 * dictionary; CTA + contact links are locale-prefixed.
 */
export function ExperiencesPageBody({ locale }: ExperiencesPageBodyProps) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.experiences, path: localePath('/experiences', locale) },
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
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={localePath('/contact', locale)}
                className="bg-olive text-ivory hover:bg-olive-deep inline-flex w-full min-w-[14rem] items-center justify-center rounded-lg px-8 py-3.5 text-sm font-medium tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                İletişime Geç
              </Link>
              <Link
                href={localePath(PRIMARY_CTA.href, locale)}
                className="bg-olive text-ivory hover:bg-olive-deep inline-flex w-full min-w-[14rem] items-center justify-center rounded-lg px-8 py-3.5 text-sm font-medium tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                {dictionary.cta.reserve}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ExperiencesPageBody;
