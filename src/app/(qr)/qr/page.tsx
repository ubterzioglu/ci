import type { Metadata } from 'next';

import { MenuCategory } from '@/components/menu/MenuCategory';
import { getMenu } from '@/lib/db/menu';
import { MENU_SERVICE_NOTE, WINE_MENU_NOTICE } from '@/content/menu-data';
import { aboutContent } from '@/content/pages-data';
import { siteConfig } from '@/lib/site-config';

/**
 * At-table QR menu. A mobile-first, chrome-free digital menu a seated guest
 * reaches by scanning a QR code on the table. Distinct from the marketing
 * /menu page: no site Header/Footer (see app/(qr)/layout.tsx), one-handed
 * scroll, with a sticky category jump-nav.
 *
 * Reuses getMenu() (Supabase → local fallback) and the MenuCategory component
 * so it stays in sync with /menu, plus aboutContent for a condensed "about"
 * block. TR-only for v1.
 *
 * Read-only and JS-free: the "about" section expands via a native
 * <details>/<summary>, so the page ships zero client JavaScript while still
 * letting a curious guest read the chef's story without leaving the table.
 */
export const metadata: Metadata = {
  title: 'Menü',
};

export default async function QrMenuPage() {
  const menu = await getMenu();

  // Condensed "about" copy, sourced verbatim from aboutContent (no fabrication).
  const aboutIntro = aboutContent.intro.paragraphs.slice(0, 2);
  const aboutMore = aboutContent.intro.paragraphs.slice(2);

  return (
    <div className="bg-marble text-charcoal min-h-screen">
      {/* Hero — warm, candle-lit charcoal. A pair of soft terracotta/olive
          radial washes (color-mix, same technique as the admin login) give the
          flat dark band depth without any image weight. */}
      <header className="bg-charcoal text-ivory relative overflow-hidden px-5 pt-12 pb-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--color-terracotta) 22%, transparent), transparent 42%), radial-gradient(circle at 84% 12%, color-mix(in srgb, var(--color-olive) 20%, transparent), transparent 40%)',
          }}
        />
        <div className="fade-up relative">
          <p className="eyebrow">Menü</p>
          <h1 className="font-display text-ivory mt-3 text-4xl leading-none">{siteConfig.name}</h1>
          <div className="rule-olive text-ivory/60 mt-4">
            <span aria-hidden className="text-sm tracking-[0.3em]">
              ❦
            </span>
          </div>
          <p className="text-ivory/75 mx-auto mt-4 max-w-xs text-sm leading-relaxed">
            {siteConfig.tagline}
          </p>
        </div>
      </header>

      {/* Sticky category jump-nav — anchor links, no client JS. */}
      {menu.length > 0 && (
        <nav
          aria-label="Menü kategorileri"
          className="border-stone-soft bg-marble/95 sticky top-0 z-10 border-b backdrop-blur"
        >
          <ul className="flex gap-2 overflow-x-auto px-4 py-3">
            {menu.map((category) => (
              <li key={category.id} className="shrink-0">
                <a
                  href={`#cat-${category.slug}`}
                  className="border-stone-soft text-olive-deep hover:border-olive hover:bg-olive hover:text-ivory block rounded-full border px-4 py-1.5 text-sm transition-colors"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <main className="mx-auto max-w-xl px-5 pt-8 pb-16">
        <p className="border-stone-soft bg-cream-deep/60 text-muted mb-8 rounded-md border px-4 py-3 text-center text-sm">
          {MENU_SERVICE_NOTE}
        </p>

        <div className="space-y-12">
          {menu.map((category) => (
            <MenuCategory key={category.id} category={category} />
          ))}
        </div>

        {/* Wine menu — item list not in source; elegant ask-the-team notice. */}
        <section
          aria-labelledby="qr-wine-heading"
          className="border-wine/25 bg-wine/5 mt-12 rounded-lg border p-6 text-center"
        >
          <h2 id="qr-wine-heading" className="font-display text-wine text-2xl">
            Şarap Menüsü
          </h2>
          <p className="text-muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            {WINE_MENU_NOTICE}
          </p>
        </section>

        {/* About — condensed, with the chef's story behind a native, JS-free
            <details> disclosure so it stays optional and the page stays light. */}
        <section
          aria-labelledby="qr-about-heading"
          className="border-stone-soft bg-cream-deep/40 mt-12 rounded-lg border p-6"
        >
          <div className="text-center">
            <p className="eyebrow">Hakkımızda</p>
            <h2 id="qr-about-heading" className="font-display text-charcoal mt-2 text-2xl">
              {aboutContent.intro.heading}
            </h2>
            <div className="rule-olive mt-4">
              <span aria-hidden className="text-sm tracking-[0.3em]">
                ❦
              </span>
            </div>
          </div>

          <div className="text-muted mt-5 space-y-3 text-sm leading-relaxed">
            {aboutIntro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <details className="group mt-4">
            <summary className="text-olive-deep hover:text-olive marker:content-none flex cursor-pointer list-none items-center justify-center gap-1.5 text-sm font-medium transition-colors select-none">
              <span className="group-open:hidden">Devamını oku</span>
              <span className="hidden group-open:inline">Daha az göster</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-4 transition-transform group-open:rotate-180"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </summary>

            <div className="text-muted mt-3 space-y-3 text-sm leading-relaxed">
              {aboutMore.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Vision */}
            <div className="mt-6">
              <h3 className="font-display text-charcoal text-lg">{aboutContent.vision.heading}</h3>
              <div className="text-muted mt-2 space-y-3 text-sm leading-relaxed">
                {aboutContent.vision.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Chef */}
            <div className="mt-6">
              <h3 className="font-display text-charcoal text-lg">{aboutContent.chef.heading}</h3>
              <p className="text-terracotta mt-1 text-sm font-medium">{aboutContent.chef.name}</p>
              <div className="text-muted mt-2 space-y-3 text-sm leading-relaxed">
                {aboutContent.chef.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </details>
        </section>

        <footer className="border-stone-soft text-muted mt-12 border-t pt-6 text-center text-sm">
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="text-olive-deep hover:text-olive font-medium transition-colors"
          >
            {siteConfig.contact.phoneDisplay}
          </a>
          <p className="mt-1">{siteConfig.contact.region}</p>
        </footer>
      </main>
    </div>
  );
}
