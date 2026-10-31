import { Hero } from '@/components/sections/Hero';
import { StorySection } from '@/components/sections/StorySection';
import { ExperienceShowcase } from '@/components/sections/ExperienceShowcase';
import { MenuPreview } from '@/components/sections/MenuPreview';
import { ReservationCTA } from '@/components/sections/ReservationCTA';
import { Gallery } from '@/components/sections/Gallery';
import { ChefIntro } from '@/components/sections/ChefIntro';
import { FaqSection } from '@/components/sections/FaqSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { LastUpdated } from '@/components/seo/LastUpdated';
import { getHomeFaq } from '@/content/home-faq';
import { HOME_DATES } from '@/content/pages-data';
import { getLocalPage } from '@/content/pages-i18n';
import { getMenu } from '@/lib/db/menu';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';
import { seoTitle } from '@/lib/seo/titles';
import { faqSchema, menuSchema, restaurantSchema, webPageSchema } from '@/lib/seo/schema';
import { LANGUAGE_TAG } from '@/lib/seo/schema/shared';
import { siteConfig } from '@/lib/site-config';
import type { Locale } from '@/lib/i18n/config';

interface HomePageBodyProps {
  locale: Locale;
}

/**
 * Shared home-page body, rendered by both the unprefixed TR route
 * (`(site)/page.tsx`, locale='tr') and the locale-prefixed EN/DE route
 * (`[lang]/(site)/page.tsx`). The locale threads into every section so text and
 * internal links are built for the active language.
 */
export async function HomePageBody({ locale }: HomePageBodyProps) {
  // Fetched for JSON-LD; the visual preview uses the static teasers.
  const menu = await getMenu(locale);
  const faq = getHomeFaq(locale);
  const path = localePath('/', locale);
  const pageUrl = new URL(path, siteConfig.url).toString();
  const page = getLocalPage('home', locale);

  return (
    <>
      {/* Restaurant node — only emitted here. Other pages reference it by @id
          (WebSite.publisher, WebPage.about) so crawlers see one business entity. */}
      <JsonLd data={restaurantSchema(locale)} />
      <JsonLd data={menuSchema(menu, locale)} />
      <JsonLd
        data={webPageSchema({
          name: seoTitle('/', locale),
          description: page?.seoDescription ?? siteConfig.description,
          path,
          inLanguage: LANGUAGE_TAG[locale],
          datePublished: HOME_DATES.published,
          dateModified: HOME_DATES.modified,
          hasFaq: true,
          speakable: true,
        })}
      />
      <JsonLd data={faqSchema(faq, pageUrl)} />
      <Hero locale={locale} />
      <StorySection locale={locale} />
      <ExperienceShowcase locale={locale} />
      <MenuPreview locale={locale} />
      <ReservationCTA locale={locale} />
      <Gallery locale={locale} />
      <ChefIntro locale={locale} />
      <FaqSection title={getDictionary(locale).home.faqTitle} items={faq} />
      <ContactSection locale={locale} />
      <LastUpdated date={HOME_DATES.modified} locale={locale} />
    </>
  );
}

export default HomePageBody;
