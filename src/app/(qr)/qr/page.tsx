import type { Metadata } from 'next';

import { MenuCategory } from '@/components/menu/MenuCategory';
import { getMenu } from '@/lib/db/menu';
import { MENU_SERVICE_NOTE, WINE_MENU_NOTICE } from '@/content/menu-data';
import { siteConfig } from '@/lib/site-config';

/**
 * At-table QR menu. A mobile-first, chrome-free digital menu a seated guest
 * reaches by scanning a QR code on the table. Distinct from the marketing
 * /menu page: no site Header/Footer (see app/(qr)/layout.tsx), one-handed
 * scroll, with a sticky category jump-nav.
 *
 * Reuses getMenu() (Supabase → local fallback) and the MenuCategory component
 * so it stays in sync with /menu. TR-only for v1. Read-only — no client JS.
 */
export const metadata: Metadata = {
  title: 'Menü',
};

export default async function QrMenuPage() {
  const menu = await getMenu();

  return (
    <div className="bg-marble text-charcoal min-h-screen">
      {/* Compact brand header */}
      <header className="bg-charcoal text-ivory px-5 pt-8 pb-6 text-center">
        <p className="eyebrow">Menü</p>
        <h1 className="font-display mt-2 text-3xl">{siteConfig.name}</h1>
        <p className="text-ivory/70 mt-1 text-sm">{siteConfig.tagline}</p>
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
