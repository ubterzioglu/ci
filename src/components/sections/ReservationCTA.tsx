import Image from 'next/image';
import Link from 'next/link';

import { homeContent } from '@/content/pages-data';
import { resolveImage } from '@/lib/images';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';

/**
 * Dark, atmospheric reservation / Chef's Table band. Carries the source's
 * "Chef's Table — özel etkinlikleriniz için iletişime geçiniz" message and the
 * primary reservation CTA.
 */
export function ReservationCTA() {
  const image = resolveImage('home-hero-table');

  return (
    <section className="relative overflow-hidden bg-charcoal py-section text-ivory">
      {image && (
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
          aria-hidden="true"
        />
      )}
      <div className="container-editorial relative z-10 text-center">
        <p className="eyebrow text-terracotta">{homeContent.chefsTable.heading}</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl text-ivory md:text-5xl">
          Masamızda yeriniz hazır
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-ivory/75">
          {homeContent.chefsTable.body}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={PRIMARY_CTA.href}
            className="rounded-md bg-olive px-6 py-3 text-ivory transition-colors hover:bg-olive-deep"
          >
            {PRIMARY_CTA.labelTr}
          </Link>
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="rounded-md border border-ivory/50 px-6 py-3 text-ivory transition-colors hover:bg-ivory hover:text-charcoal"
          >
            {siteConfig.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

export default ReservationCTA;
