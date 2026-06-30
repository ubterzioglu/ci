import Image from 'next/image';

import { getAboutContent } from '@/content/pages-i18n';
import { resolveImage } from '@/lib/images';
import { siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

interface ChefIntroProps {
  locale?: Locale;
}

/** Bare host for the website link (no scheme/path) — e.g. "www.cineocucina.com". */
function websiteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * "Şefle Tanışalım" — the full chef introduction (Simge Manacıoğlu). An
 * editorial left/right split: the chef portrait alongside the complete bio and
 * a contact line (phone + website). All copy is single-sourced from
 * `aboutContent.chef` (pages-data.ts); the portrait, phone and site URL come
 * from the shared media manifest and site config — no facts are invented here.
 *
 * Distinct from StorySection ("Hikâyemiz"), which shows only the opening two
 * paragraphs as a teaser into /about. This section presents the whole bio.
 */
export function ChefIntro({ locale = defaultLocale }: ChefIntroProps) {
  const { chef } = getAboutContent(locale);
  const portrait = resolveImage('chef-simge');
  const { contact, url } = siteConfig;

  return (
    <section className="bg-marble py-section">
      <div className="container-editorial">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
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
            <h2 className="font-display text-charcoal text-3xl md:text-4xl">{chef.heading}</h2>
            <div className="rule-olive mt-4" aria-hidden="true" />

            <div className="mt-8 space-y-4">
              {chef.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-charcoal/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="text-muted mt-8 text-sm">
              <span>Tel: </span>
              <a
                href={`tel:${contact.phoneE164}`}
                className="text-olive transition-colors hover:text-olive-deep"
              >
                {contact.phoneDisplay}
              </a>
              <span className="mx-2 text-stone">|</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-olive"
              >
                {websiteLabel(url)}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChefIntro;
