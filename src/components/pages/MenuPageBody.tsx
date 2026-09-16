import { PageHeader } from '@/components/layout/PageHeader';
import { MenuTabs } from '@/components/menu/MenuTabs';
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
  // Both menus in one round trip; the wine list is empty until the restaurant
  // adds one, and the tab falls back to the "ask our team" notice.
  const [menu, wineMenu] = await Promise.all([getMenu(locale, 'food'), getMenu(locale, 'wine')]);
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
        <div className="container-editorial max-w-4xl">
          <MenuTabs
            categories={menu}
            wineCategories={wineMenu}
            serviceNote={getMenuServiceNote(locale)}
            wineNotice={getWineMenuNotice(locale)}
          />
        </div>
      </div>
    </>
  );
}

export default MenuPageBody;
