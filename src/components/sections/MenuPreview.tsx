import Link from 'next/link';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeContent } from '@/content/pages-data';

/**
 * Home-page menu teaser. Mirrors the three menu strands from the source site
 * (Ana Menü / Günün Spesiyali / Şarap Menüsü) as quiet cards that lead to the
 * full menu. Set on a deeper cream panel for contrast with the white sections.
 */
export function MenuPreview() {
  return (
    <section className="bg-cream-deep py-section">
      <div className="container-editorial">
        <SectionHeading eyebrow="Soframız" title="Menümüzden Bir Tat" align="center" />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {homeContent.menusTeaser.map((teaser) => (
            <Link
              key={teaser.key}
              href={teaser.href}
              className="group flex flex-col rounded-lg border border-stone-soft bg-marble p-7 transition-colors hover:border-olive"
            >
              <h3 className="font-display text-2xl text-charcoal transition-colors group-hover:text-olive">
                {teaser.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {teaser.description}
              </p>
              <span className="mt-5 text-sm tracking-wide text-terracotta">Sayfaya Git →</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-block rounded-md border border-olive px-6 py-3 text-olive transition-colors hover:bg-olive hover:text-ivory"
          >
            Tüm Menüyü Görüntüle
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MenuPreview;
