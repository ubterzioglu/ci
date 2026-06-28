import Image from 'next/image';
import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { aboutContent } from '@/content/pages-data';
import { resolveImage } from '@/lib/images';

/**
 * Home-page brand story / chef introduction. An asymmetric editorial split:
 * the chef portrait alongside the opening of the story, with a link through to
 * the full About page. Uses the real chef bio from the source (Simge
 * Manacıoğlu) — no invented facts.
 */
export function StorySection() {
  const portrait = resolveImage('chef-simge');
  const lead = aboutContent.intro.paragraphs.slice(0, 2);

  return (
    <section className="bg-marble py-section">
      <div className="container-editorial">
        <SectionHeading
          eyebrow="Hikâyemiz"
          title={aboutContent.intro.heading}
          align="center"
        />

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
              <p
                key={index}
                className="mb-4 text-lg leading-relaxed text-charcoal/90 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-6 font-display text-2xl text-olive">
              {aboutContent.chef.name}
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-sm tracking-wide text-terracotta underline-offset-4 transition hover:underline"
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
