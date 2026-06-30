import { PageHeader } from '@/components/layout/PageHeader';
import { MenuCategory } from '@/components/menu/MenuCategory';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMenu } from '@/lib/db/menu';
import { getMenuServiceNote, getWineMenuNotice } from '@/content/menu-data';
import { breadcrumbSchema, menuSchema } from '@/lib/seo/schema';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface MenuPageBodyProps {
  locale: Locale;
}

/**
 * Shared menu-page body for both the TR and the EN/DE routes. Pulls the
 * locale-correct menu, service note and wine notice; breadcrumb labels come
 * from the dictionary and breadcrumb paths are locale-prefixed.
 */
export async function MenuPageBody({ locale }: MenuPageBodyProps) {
  const menu = await getMenu(locale);
  const dictionary = getDictionary(locale);

  return (
    <>
      <JsonLd data={menuSchema(menu)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dictionary.nav.home, path: localePath('/', locale) },
          { name: dictionary.nav.menu, path: localePath('/menu', locale) },
        ])}
      />

      <PageHeader
        eyebrow="Soframız"
        title={dictionary.nav.menu}
        intro="Mevsiminde malzemeyle, sade ama derin tatlar. Üç başlıkta toplanan menümüz topraktan, denizden ve otlaktan ilham alır."
      />

      <div className="bg-marble pb-section">
        <div className="container-editorial">
          <p className="border-stone-soft bg-cream-deep/60 text-muted mx-auto mb-12 max-w-2xl rounded-md border px-5 py-3 text-center text-sm">
            {getMenuServiceNote(locale)}
          </p>

          <div className="space-y-16">
            {menu.map((category) => (
              <MenuCategory key={category.id} category={category} />
            ))}
          </div>

          {/* Wine menu — item list not in source; elegant ask-the-team notice */}
          <section
            aria-labelledby="wine-heading"
            className="border-wine/25 bg-wine/5 mt-16 rounded-lg border p-8 text-center"
          >
            <h2 id="wine-heading" className="font-display text-wine text-3xl">
              Şarap Menüsü
            </h2>
            <p className="text-muted mx-auto mt-3 max-w-xl text-sm leading-relaxed">
              {getWineMenuNotice(locale)}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default MenuPageBody;
