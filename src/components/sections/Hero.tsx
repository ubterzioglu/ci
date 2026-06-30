import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { getHomeContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface HeroProps {
  locale?: Locale;
}

/**
 * The hero is the page's thesis: open on the most characteristic image in the
 * restaurant's world — the olive-grove garden at dusk — with the name set in
 * the display serif. Quiet, atmospheric, with a clear reservation CTA.
 */
export function Hero({ locale = defaultLocale }: HeroProps) {
  const image = resolveImage('restaurant-garden-night');
  const home = getHomeContent(locale);
  const dictionary = getDictionary(locale);

  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden">
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      {/* Warm legibility gradient */}
      <div
        aria-hidden="true"
        className="from-charcoal/85 via-charcoal/35 to-charcoal/30 absolute inset-0 bg-gradient-to-t"
      />

      <div className="container-editorial relative z-10 pt-32 pb-16 md:pb-24">
        <div className="fade-up max-w-2xl">
          <p className="eyebrow text-terracotta/90">{siteConfig.contact.region}</p>
          <h1 className="font-display text-ivory mt-4 text-5xl leading-[1.05] md:text-7xl">
            {home.hero.title}
          </h1>
          <p className="text-ivory/85 mt-5 max-w-xl text-lg md:text-xl">{home.hero.subtitle}</p>
          <p className="text-ivory/70 mt-2 max-w-xl text-base">{home.hero.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={localePath(PRIMARY_CTA.href, locale)}
              variant="glass"
              size="lg"
              className="min-w-[12rem]"
            >
              {dictionary.cta.reserve}
            </Button>
            <Button
              href={localePath('/menu', locale)}
              variant="glass-outline"
              size="lg"
              className="min-w-[12rem]"
            >
              {dictionary.nav.menu}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
