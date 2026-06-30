import Image from 'next/image';
import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { getHomeContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';

/**
 * Premium "deneyim" showcase. Frosted-glass cards float over the night-garden
 * photo, a more refined cousin of the MenuPreview teaser. Sits between
 * StorySection and MenuPreview on the home page.
 *
 * The grid adapts to the number of confirmed experiences in
 * `homeContent.experiences` (currently a single brand-real card, "Chef's
 * Table"); a lone card is centred and width-capped rather than stranded in a
 * three-column track.
 *
 * Server component, no client JS — hover/entrance effects are pure CSS and
 * `prefers-reduced-motion` is handled globally in globals.css.
 */

/**
 * Supported experience icons. Declared explicitly (not derived from
 * `homeContent.experiences`) so the icon set stays stable even when only one
 * experience is currently published — the 'wine'/'olive' art is kept ready for
 * experiences the restaurant may add back later.
 */
type ExperienceIconName = 'plate' | 'wine' | 'olive';

/** Small hand-drawn-style line-art icons (warm gold stroke), decorative only. */
function ExperienceIcon({ name }: { name: ExperienceIconName }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'plate':
      // Fork + plate (Chef's Table)
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4.5" />
          <path d="M19.5 3v7M21 3v7M18 3v7" transform="translate(-1 0)" />
        </svg>
      );
    case 'wine':
      // Wine glass (Şarap Eşleştirme)
      return (
        <svg {...common}>
          <path d="M7 3h10l-1 5a4 4 0 0 1-8 0L7 3Z" />
          <path d="M12 13v6" />
          <path d="M8.5 21h7" />
        </svg>
      );
    case 'olive':
      // Olive branch (Bahçe Akşamları)
      return (
        <svg {...common}>
          <path d="M5 20c3-7 8-12 14-15" />
          <path d="M14 6c.5-1.6 2-2.6 3.6-2.4C17.4 5.2 16 6.3 14 6Z" />
          <path d="M11 10c.3-1.6 1.7-2.7 3.4-2.6C14.1 9 12.8 10.1 11 10Z" />
          <path d="M8 14c.2-1.6 1.5-2.7 3.2-2.7C11 13 9.7 14.1 8 14Z" />
        </svg>
      );
  }
}

interface ExperienceShowcaseProps {
  locale?: Locale;
}

export function ExperienceShowcase({ locale = defaultLocale }: ExperienceShowcaseProps) {
  const background = resolveImage('restaurant-garden-night');
  const experiences = getHomeContent(locale).experiences;
  // A single card is centred and width-capped; multiple cards use a 3-col grid.
  const gridClass =
    experiences.length === 1
      ? 'mx-auto mt-12 grid max-w-md gap-6'
      : 'mt-12 grid gap-6 md:grid-cols-3';

  return (
    <section className="py-section relative isolate overflow-hidden">
      {background && (
        <Image
          src={background.src}
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="-z-10 object-cover"
        />
      )}
      {/* Charcoal gradient keeps card text AA-readable over any photo region. */}
      <div
        aria-hidden="true"
        className="from-charcoal/85 via-charcoal/70 to-charcoal/85 absolute inset-0 -z-10 bg-gradient-to-b"
      />

      <div className="container-editorial">
        <SectionHeading eyebrow="Deneyim" title="Sofranın Ötesinde" align="center" tone="light" />

        <div className={gridClass}>
          {experiences.map((experience) => (
            <Link
              key={experience.key}
              href={localePath(experience.href, locale)}
              className="group border-ivory/15 bg-ivory/8 hover:border-ivory/30 hover:bg-ivory/12 flex flex-col rounded-lg border p-7 backdrop-blur-md transition duration-300 hover:-translate-y-1"
            >
              <span className="text-[#d8a25e]">
                <ExperienceIcon name={experience.icon} />
              </span>
              {/* Gold hairline beneath the icon — quiet premium accent. */}
              <span
                aria-hidden="true"
                className="mt-4 block h-px w-10 bg-gradient-to-r from-[#d8a25e]/80 to-transparent"
              />

              <h3 className="font-display text-ivory mt-5 text-2xl">{experience.title}</h3>
              <p className="text-ivory/75 mt-3 flex-1 text-sm leading-relaxed">
                {experience.description}
              </p>
              <span className="mt-5 text-sm tracking-wide text-[#d8a25e]">Deneyimi Keşfet →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExperienceShowcase;
