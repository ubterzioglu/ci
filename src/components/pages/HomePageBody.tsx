import { Hero } from '@/components/sections/Hero';
import { StorySection } from '@/components/sections/StorySection';
import { ExperienceShowcase } from '@/components/sections/ExperienceShowcase';
import { MenuPreview } from '@/components/sections/MenuPreview';
import { ReservationCTA } from '@/components/sections/ReservationCTA';
import { Gallery } from '@/components/sections/Gallery';
import { ChefIntro } from '@/components/sections/ChefIntro';
import { ContactSection } from '@/components/sections/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMenu } from '@/lib/db/menu';
import { menuSchema, restaurantSchema } from '@/lib/seo/schema';
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

  return (
    <>
      {/* Full Restaurant node — only emitted here. Other pages carry a compact
          @id reference (see layout.tsx) so crawlers see one business entity. */}
      <JsonLd data={restaurantSchema(locale)} />
      <JsonLd data={menuSchema(menu, locale)} />
      <Hero locale={locale} />
      <StorySection locale={locale} />
      <ExperienceShowcase locale={locale} />
      <MenuPreview locale={locale} />
      <ReservationCTA locale={locale} />
      <Gallery locale={locale} />
      <ChefIntro locale={locale} />
      <ContactSection locale={locale} />
    </>
  );
}

export default HomePageBody;
