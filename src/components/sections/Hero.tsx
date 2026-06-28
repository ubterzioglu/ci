import Image from 'next/image';
import Link from 'next/link';

import { homeContent } from '@/content/pages-data';
import { resolveImage } from '@/lib/images';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';

/**
 * The hero is the page's thesis: open on the most characteristic image in the
 * restaurant's world — the olive-grove garden at dusk — with the name set in
 * the display serif. Quiet, atmospheric, with a clear reservation CTA.
 */
export function Hero() {
  const image = resolveImage('restaurant-garden-night');

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
        className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/30"
      />

      <div className="container-editorial relative z-10 pb-16 pt-32 md:pb-24">
        <div className="max-w-2xl fade-up">
          <p className="eyebrow text-terracotta/90">{siteConfig.contact.region}</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ivory md:text-7xl">
            {homeContent.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ivory/85 md:text-xl">
            {homeContent.hero.subtitle}
          </p>
          <p className="mt-2 max-w-xl text-base text-ivory/70">
            {homeContent.hero.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={PRIMARY_CTA.href}
              className="rounded-md bg-olive px-6 py-3 text-ivory transition-colors hover:bg-olive-deep"
            >
              {PRIMARY_CTA.labelTr}
            </Link>
            <Link
              href="/menu"
              className="rounded-md border border-ivory/60 px-6 py-3 text-ivory transition-colors hover:bg-ivory hover:text-charcoal"
            >
              Menüye Bak
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
