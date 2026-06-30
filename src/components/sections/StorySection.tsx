import Image from 'next/image';
import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAboutContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';

interface StorySectionProps {
  locale?: Locale;
}

/**
 * Home-page brand story / chef introduction. An asymmetric editorial split:
 * the chef portrait alongside the opening of the story, with a link through to
 * the full About page. Uses the real chef bio from the source (Simge
 * Manacıoğlu) — no invented facts.
 */
export function StorySection({ locale = defaultLocale }: StorySectionProps) {
  const portrait = resolveImage('chef-simge');
  const about = getAboutContent(locale);
  const lead = about.intro.paragraphs.slice(0, 2);

  return (
    <section className="bg-marble py-section">
      <div className="container-editorial">
        <SectionHeading eyebrow="Hikâyemiz" title={about.intro.heading} align="center" />

        <div className="mt-12 grid items-center gap-10 md:grid-cols-12">
          {portrait && (
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="md:col-span-7">
            {lead.map((paragraph, index) => (
              <p key={index} className="text-charcoal/90 mb-4 text-lg leading-relaxed last:mb-0">
                {paragraph}
              </p>
            ))}
            <p className="font-display text-olive mt-6 text-2xl">{about.chef.name}</p>
            <Link
              href={localePath('/about', locale)}
              className="text-terracotta mt-6 inline-block text-sm tracking-wide underline-offset-4 transition hover:underline"
            >
              Hikâyenin tamamını okuyun →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorySection;
