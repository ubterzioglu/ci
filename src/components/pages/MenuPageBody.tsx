import { PageHeader } from '@/components/layout/PageHeader';
import { MenuTabs } from '@/components/menu/MenuTabs';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMenu } from '@/lib/db/menu';
import { getMenuServiceNote, getWineMenuNotice } from '@/content/menu-data';
import { getWinePriceLabels } from '@/content/wine-menu-data';
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
  // Fetch both menus together; each has a local fallback when Supabase is not
  // configured or the corresponding rows have not been seeded yet.
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
        eyebrow={dictionary.pages.menu.eyebrow}
        title={dictionary.nav.menu}
        intro={dictionary.pages.menu.intro}
      />

      <div className="bg-marble pb-section">
        <div className="container-editorial max-w-4xl">
          <MenuTabs
            categories={menu}
            wineCategories={wineMenu}
            serviceNote={getMenuServiceNote(locale)}
            wineNotice={getWineMenuNotice(locale)}
            winePriceLabels={getWinePriceLabels(locale)}
            tabLabels={{
              aria: dictionary.pages.menu.tabAria,
              food: dictionary.pages.menu.mainTab,
              wine: dictionary.pages.menu.wineTab,
            }}
            allergensLabel={dictionary.pages.menu.allergens}
          />
        </div>
      </div>
    </>
  );
}

export default MenuPageBody;
