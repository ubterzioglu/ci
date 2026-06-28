import type { Metadata } from 'next';
import Image from 'next/image';

import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { JsonLd } from '@/components/seo/JsonLd';
import { aboutContent } from '@/content/pages-data';
import { getMediaByContext } from '@/content/media-data';
import { resolveImage } from '@/lib/images';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = buildMetadata({
  title: 'Hakkımızda',
  description:
    'Çi Neo Cucina’nın dinginlik, sürdürülebilirlik, yerel malzeme ve Akdeniz sofrası odaklı hikâyesi.',
  path: '/about',
});

export default function AboutPage() {
  const portrait = resolveImage('chef-simge');
  const teamPhotos = getMediaByContext('about');

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Hakkımızda', path: '/about' },
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
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {teamPhotos.map((photo) => {
                const image = resolveImage(photo.id);
                if (!image) return null;
                return (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>
          )}
          <ul className="font-display text-olive mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center text-2xl">
            {aboutContent.team.members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
