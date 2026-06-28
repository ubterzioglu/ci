import Image from 'next/image';
import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeContent } from '@/content/pages-data';
import { resolveImage } from '@/lib/images';

/**
 * Premium "deneyim" showcase. Three frosted-glass cards float over the
 * night-garden photo, a more refined cousin of the MenuPreview teaser. Sits
 * between StorySection and MenuPreview on the home page.
 *
 * Server component, no client JS — hover/entrance effects are pure CSS and
 * `prefers-reduced-motion` is handled globally in globals.css.
 */

type ExperienceIconName = (typeof homeContent.experiences)[number]['icon'];

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

export function ExperienceShowcase() {
  const background = resolveImage('restaurant-garden-night');

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

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {homeContent.experiences.map((experience) => (
            <Link
              key={experience.key}
              href={experience.href}
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
