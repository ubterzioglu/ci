import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { MenuCategory } from '@/components/menu/MenuCategory';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMenu } from '@/lib/db/menu';
import { MENU_SERVICE_NOTE, WINE_MENU_NOTICE } from '@/content/menu-data';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, menuSchema } from '@/lib/seo/schema';

export const metadata: Metadata = buildMetadata({
  title: 'Menü',
  description:
    'Çi Neo Cucina ana menüsü: topraktan, denizden ve otlaktan lezzetler; yerel üreticilerden şarap seçkisi.',
  path: '/menu',
});

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <>
      <JsonLd data={menuSchema(menu)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Menü', path: '/menu' },
        ])}
      />

      <PageHeader
        eyebrow="Soframız"
        title="Menü"
        intro="Mevsiminde malzemeyle, sade ama derin tatlar. Üç başlıkta toplanan menümüz topraktan, denizden ve otlaktan ilham alır."
      />

      <div className="bg-marble pb-section">
        <div className="container-editorial">
          <p className="mx-auto mb-12 max-w-2xl rounded-md border border-stone-soft bg-cream-deep/60 px-5 py-3 text-center text-sm text-muted">
            {MENU_SERVICE_NOTE}
          </p>

          <div className="space-y-16">
            {menu.map((category) => (
              <MenuCategory key={category.id} category={category} />
            ))}
          </div>

          {/* Wine menu — item list not in source; elegant ask-the-team notice */}
          <section
            aria-labelledby="wine-heading"
            className="mt-16 rounded-lg border border-wine/25 bg-wine/5 p-8 text-center"
          >
            <h2 id="wine-heading" className="font-display text-3xl text-wine">
              Şarap Menüsü
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              {WINE_MENU_NOTICE}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
