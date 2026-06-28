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
    <section className="bg-charcoal py-section text-ivory relative overflow-hidden">
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
        <h2 className="font-display text-ivory mx-auto mt-4 max-w-2xl text-3xl md:text-5xl">
          Masamızda yeriniz hazır
        </h2>
        <p className="text-ivory/75 mx-auto mt-5 max-w-xl">{homeContent.chefsTable.body}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={PRIMARY_CTA.href}
            className="bg-olive text-ivory hover:bg-olive-deep rounded-md px-6 py-3 transition-colors"
          >
            {PRIMARY_CTA.labelTr}
          </Link>
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="border-ivory/50 text-ivory hover:bg-ivory hover:text-charcoal rounded-md border px-6 py-3 transition-colors"
          >
            {siteConfig.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

export default ReservationCTA;
