import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { getHomeContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface ReservationCTAProps {
  locale?: Locale;
}

/**
 * Dark, atmospheric reservation / Chef's Table band. Carries the source's
 * "Chef's Table — özel etkinlikleriniz için iletişime geçiniz" message and the
 * primary reservation CTA.
 */
export function ReservationCTA({ locale = defaultLocale }: ReservationCTAProps) {
  const image = resolveImage('home-hero-table');
  const chefsTable = getHomeContent(locale).chefsTable;
  const dictionary = getDictionary(locale);

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
        <p className="eyebrow text-terracotta">{chefsTable.heading}</p>
        <h2 className="font-display text-ivory mx-auto mt-4 max-w-2xl text-3xl md:text-5xl">
          Masamızda yeriniz hazır
        </h2>
        <p className="text-ivory/75 mx-auto mt-5 max-w-xl">{chefsTable.body}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={localePath(PRIMARY_CTA.href, locale)} variant="glass" size="lg">
            {dictionary.cta.reserve}
          </Button>
          <a href={`tel:${siteConfig.contact.phoneE164}`} className="btn btn-glass-outline btn-lg">
            {siteConfig.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

export default ReservationCTA;
