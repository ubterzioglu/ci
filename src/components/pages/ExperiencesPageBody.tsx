import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/schema';
import { PRIMARY_CTA } from '@/lib/site-config';
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

  // FAQ items for structured data — not linked from navigation or sitemap.
  const { experiences: faq } = dictionary.faq;
  const faqItems = [
    { question: faq.q1, answer: faq.a1 },
    { question: faq.q2, answer: faq.a2 },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.experiences, path: localePath('/experiences', locale) },
        ])}
      />
      <JsonLd data={faqSchema(faqItems)} />

      <PageHeader
        eyebrow="Çi Neo Cucina"
        title={dictionary.pages.experiences.title}
        intro={dictionary.pages.experiences.intro}
      />

      {/* Last updated */}
      <div className="bg-marble pt-6 pb-0">
        <div className="container-editorial">
          <p className="text-muted text-center text-xs">{dictionary.meta.lastUpdated}</p>
        </div>
      </div>

      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <div className="border-stone-soft bg-cream-deep/40 mx-auto max-w-2xl rounded-lg border p-8 text-center md:p-12">
            <p className="font-display text-charcoal text-2xl">
              {dictionary.pages.experiences.cardTitle}
            </p>
            <p className="text-muted mx-auto mt-4 max-w-xl leading-relaxed">
              {dictionary.pages.experiences.contactText}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href={localePath(PRIMARY_CTA.href, locale)}
                variant="solid"
                size="lg"
                className="w-full min-w-[14rem] sm:w-auto"
              >
                {dictionary.cta.reserve}
              </Button>
              <Button
                href={localePath('/contact', locale)}
                variant="outline"
                size="lg"
                className="w-full min-w-[14rem] sm:w-auto"
              >
                {dictionary.pages.experiences.contactCta}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ExperiencesPageBody;
