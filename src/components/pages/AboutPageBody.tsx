import Image from 'next/image';

import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAboutContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { getTeamPhotos } from '@/lib/db/team-photos';
import { breadcrumbSchema } from '@/lib/seo/schema';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface AboutPageBodyProps {
  locale: Locale;
}

/**
 * Shared about-page body for both the TR and the EN/DE routes. Pulls the
 * locale-correct about content; breadcrumb labels come from the dictionary and
 * breadcrumb paths are locale-prefixed.
 */
export async function AboutPageBody({ locale }: AboutPageBodyProps) {
  const aboutContent = getAboutContent(locale);
  const dictionary = getDictionary(locale);
  const portrait = resolveImage('chef-simge');
  const teamPhotos = await getTeamPhotos();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.about, path: localePath('/about', locale) },
        ])}
      />

      <PageHeader eyebrow="Çi Neo Cucina" title={aboutContent.title} />

      {/* Intro / story */}
      <section className="bg-marble pb-section">
        <div className="container-editorial">
          <SectionHeading title={aboutContent.intro.heading} align="center" />
          <div className="mx-auto mt-10 max-w-2xl space-y-5">
            {aboutContent.intro.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-charcoal/90 text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Chef */}
      <section className="bg-cream-deep py-section">
        <div className="container-editorial grid items-center gap-10 md:grid-cols-12">
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
            <p className="eyebrow">{aboutContent.chef.heading}</p>
            <h2 className="font-display text-charcoal mt-3 text-4xl">{aboutContent.chef.name}</h2>
            <div className="mt-6 space-y-4">
              {aboutContent.chef.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-charcoal/85 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-charcoal py-section text-ivory">
        <div className="container-editorial mx-auto max-w-3xl text-center">
          <p className="eyebrow text-terracotta">{aboutContent.vision.heading}</p>
          <div className="mt-6 space-y-5">
            {aboutContent.vision.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-ivory/85 text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-marble py-section">
        <div className="container-editorial">
          <SectionHeading
            eyebrow={aboutContent.team.note}
            title={aboutContent.team.heading}
            align="center"
          />
          {teamPhotos.length > 0 && (
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {teamPhotos.map((photo) => (
                <figure key={photo.id}>
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className="font-display text-olive mt-3 text-xl">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          {/* Member names — shown when the photos carry no captions of their own
              (e.g. the static fallback), so the team is always credited. */}
          {!teamPhotos.some((photo) => photo.caption) && (
            <ul className="font-display text-olive mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center text-2xl">
              {aboutContent.team.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default AboutPageBody;
