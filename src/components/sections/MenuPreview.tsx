import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { getHomeContent } from '@/content/pages-i18n';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { localePath } from '@/lib/i18n/paths';

interface MenuPreviewProps {
  locale?: Locale;
}

/**
 * Home-page menu teaser. Mirrors the three menu strands from the source site
 * (Ana Menü / Günün Spesiyali / Şarap Menüsü) as quiet cards that lead to the
 * full menu. Set on a deeper cream panel for contrast with the white sections.
 */
export function MenuPreview({ locale = defaultLocale }: MenuPreviewProps) {
  const menusTeaser = getHomeContent(locale).menusTeaser;

  return (
    <section className="bg-cream-deep py-section">
      <div className="container-editorial">
        <SectionHeading eyebrow="Soframız" title="Menümüzden Bir Tat" align="center" />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {menusTeaser.map((teaser) => (
            <Link
              key={teaser.key}
              href={localePath(teaser.href, locale)}
              className="group border-stone-soft bg-marble hover:border-olive flex flex-col rounded-lg border p-7 transition-colors"
            >
              <h3 className="font-display text-charcoal group-hover:text-olive text-2xl transition-colors">
                {teaser.title}
              </h3>
              <p className="text-muted mt-3 flex-1 text-sm leading-relaxed">{teaser.description}</p>
              <span className="text-terracotta mt-5 text-sm tracking-wide">Sayfaya Git →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={localePath('/menu', locale)}
            className="border-olive text-olive hover:bg-olive hover:text-ivory inline-block rounded-md border px-6 py-3 transition-colors"
          >
            Tüm Menüyü Görüntüle
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MenuPreview;
