import type { Locale } from '@/lib/i18n/config';
import { defaultLocale } from '@/lib/i18n/config';
import type { MenuCategory } from '@/lib/types';
import { menuNotesByLocale, menuTextByLocale } from './menu-i18n';

/**
 * Local menu data — extracted verbatim from the Wix export
 * (ref/content/data/menu.json), cleaned only for spacing/typos.
 *
 * This is the development fallback used when Supabase is not configured, and
 * the source for the database seed (scripts/seed-supabase.ts). Prices are in
 * Turkish Lira (₺) as numeric major units.
 *
 * Turkish is the canonical source: `menuCategories` below holds the full
 * structure (ids, prices, tags, allergens). EN/DE are applied as text-only
 * overlays via `getLocalMenu(locale)` (see menu-i18n.ts) so non-text data is
 * never duplicated across languages.
 *
 * NOTE: The wine menu ("Şarap Menüsü") exists on the source site but its item
 * list was not exported (panel-only). See TODO_PANEL_EXPORTS.md. The Menu page
 * shows a tasteful "ask our team" notice instead of an empty section.
 */

export const MENU_SERVICE_NOTE =
  'Sonunda * olan ürünler ana yemek porsiyonundadır. Hesaba %10 servis bedeli eklenecektir.';

export const WINE_MENU_NOTICE =
  'Büyük oranda yerel üreticilerden oluşan şarap seçkimiz için lütfen ekibimize danışın.';

export const menuCategories: MenuCategory[] = [
  {
    id: 'topraktan',
    name: 'Topraktan',
    slug: 'topraktan',
    description: 'Mevsiminde, topraktan gelen sebze ve otlarla hazırlanan tabaklar.',
    sortOrder: 1,
    items: [
      {
        id: 'mezetaryen-meze-seckisi',
        name: 'Mezetaryen Meze Seçkisi',
        description: 'Üç çeşit mevsimsel “mezetaryen” mezesi.',
        price: 580,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vegan', 'Vejetaryen'],
        allergens: [],
        dietaryFlags: ['vegan', 'vegetarian'],
        sortOrder: 1,
      },
      {
        id: 'urla-enginar-confit',
        name: 'Urla Enginar Confit',
        description: 'Taze yeşillikler, laktofermente meyve ve Memecik zeytinyağı.',
        price: 450,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vegan', 'Vejetaryen'],
        allergens: [],
        dietaryFlags: ['vegan', 'vegetarian'],
        sortOrder: 2,
      },
      {
        id: 'tuzlu-kavun',
        name: 'Tuzlu Kavun',
        description: 'Antakya tuzlu yoğurdu, kavun dilimleri, beyaz leblebi ve Memecik zeytinyağı.',
        price: 420,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vejetaryen'],
        allergens: ['süt'],
        dietaryFlags: ['vegetarian'],
        sortOrder: 3,
      },
      {
        id: 'uc-mantarli-taze-cavatelli',
        name: 'Üç Mantarlı Taze Cavatelli',
        description: 'Porçini, sarıkız, istiridye mantarı ve yıllanmış koyun Mihaliç peyniri.',
        price: 550,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vejetaryen'],
        allergens: ['gluten', 'süt'],
        dietaryFlags: ['vegetarian'],
        sortOrder: 4,
      },
      {
        id: 'kereviz-sinitzel',
        name: 'Kereviz Şinitzel',
        description: 'Panelenmiş kereviz dilimleri, hibeş ve kaşık salata.',
        price: 820,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vegan', 'Vejetaryen'],
        allergens: ['gluten'],
        dietaryFlags: ['vegan', 'vegetarian'],
        sortOrder: 5,
      },
      {
        id: 'ci-salatasi',
        name: '“Çi” Salatası',
        description:
          'Roka, yabani semizotu, Yedikule marul, mevsim meyvesi, Çorum Kargı tulumu, fırın ceviz ve salatalık vinaigrette.',
        price: 500,
        currency: 'TRY',
        imageUrl: null,
        tags: ['Vegan', 'Vejetaryen'],
        allergens: ['süt', 'sert kabuklu yemiş'],
        dietaryFlags: ['vegan', 'vegetarian'],
        sortOrder: 6,
      },
    ],
  },
  {
    id: 'denizden',
    name: 'Denizden',
    slug: 'denizden',
    description: 'Ege ve Akdeniz’in deniz mahsulleriyle hazırlanan tabaklar.',
    sortOrder: 2,
    items: [
      {
        id: 'avokadolu-fume-somon-tartar',
        name: 'Avokadolu Füme Somon Tartar',
        description: 'Kapari meyvesi ve kıtırlarla.',
        price: 580,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['balık', 'gluten'],
        dietaryFlags: [],
        sortOrder: 1,
      },
      {
        id: 'karisik-kabuklu-kasesi',
        name: 'Karışık Kabuklu Kasesi',
        description: 'Vongole, kidonya, kara midye, sülünez, tarak; domates veya şarap sosuyla.',
        price: 820,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['kabuklu deniz ürünü'],
        dietaryFlags: [],
        sortOrder: 2,
      },
      {
        id: 'ci-karides',
        name: '“Çi” Karides',
        description: 'Afyon ekşi mayalı ekmeği ve botargalı tereyağı.',
        price: 820,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['kabuklu deniz ürünü', 'gluten', 'süt'],
        dietaryFlags: [],
        sortOrder: 3,
      },
      {
        id: 'izgara-baby-kalamar',
        name: 'Izgara Baby Kalamar',
        description: 'Domates civesi ve yıllanmış Mihaliç peyniri.',
        price: 780,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['yumuşakça', 'süt'],
        dietaryFlags: [],
        sortOrder: 4,
      },
      {
        id: 'aslan-baligi',
        name: 'Aslan Balığı',
        description: 'Fesleğen ve yeşil elmalı beurre blanc sos.',
        price: 900,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['balık', 'süt'],
        dietaryFlags: [],
        sortOrder: 5,
      },
      {
        id: 'izgara-granyoz',
        name: 'Izgara Granyöz',
        description: 'Hıyarlı karabuğday salata ve esmer tereyağlı kapari sos.',
        price: 950,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['balık', 'süt'],
        dietaryFlags: [],
        sortOrder: 6,
      },
      {
        id: 'karidesli-arpa-sehriye-risotto',
        name: 'Karidesli Arpa Şehriye Risotto',
        description: 'Bisk ve keçi peyniri.',
        price: 950,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['kabuklu deniz ürünü', 'gluten', 'süt'],
        dietaryFlags: [],
        sortOrder: 7,
      },
      {
        id: 'deniz-mahsullu-makarna',
        name: 'Deniz Mahsullü Makarna',
        description:
          'San Marzano domates sosu, karides, kalamar, iç midye, vongole ve Divle obruk peyniri.',
        price: 950,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['kabuklu deniz ürünü', 'yumuşakça', 'gluten', 'süt'],
        dietaryFlags: [],
        sortOrder: 8,
      },
    ],
  },
  {
    id: 'otlaktan',
    name: 'Otlaktan',
    slug: 'otlaktan',
    description: 'Etin ve sakatatın özenle pişirildiği ana tabaklar.',
    sortOrder: 3,
    items: [
      {
        id: 'sakatat-pate',
        name: 'Sakatat Pate',
        description: 'Kuzu uykuluk, kuzu beyni, tavuk ciğeri ve yüreği.',
        price: 650,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: [],
        dietaryFlags: [],
        sortOrder: 1,
      },
      {
        id: 'dana-yanak-ragu',
        name: 'Dana Yanak Ragu',
        description: 'Salsa salata ile.',
        price: 750,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: [],
        dietaryFlags: [],
        sortOrder: 2,
      },
      {
        id: 'arnavut-cigeri',
        name: 'Arnavut Ciğeri',
        description: 'Soğan salatası ve el açması kıtır yufka ekmeği.',
        price: 750,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['gluten'],
        dietaryFlags: [],
        sortOrder: 3,
      },
      {
        id: 'izgara-kuzu-kokorec',
        name: 'Izgara Kuzu Kokoreç',
        description: 'Denizli kale biberi, Antakya tuzlu yoğurdu ve kibrit hıyar salata.',
        price: 980,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['süt'],
        dietaryFlags: [],
        sortOrder: 4,
      },
      {
        id: 'kuzu-haslama',
        name: 'Kuzu Haşlama',
        description: 'Siyah bira ve sebzelerle.',
        price: 1250,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: ['gluten'],
        dietaryFlags: [],
        sortOrder: 5,
      },
      {
        id: 'izgara-kuzu-sirt',
        name: 'Izgara Kuzu Sırt',
        description: 'Karamelize kereviz püresi ve fasulye.',
        price: 1300,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: [],
        dietaryFlags: [],
        sortOrder: 6,
      },
      {
        id: 'izgara-dana-kontrfile-dilimleri',
        name: 'Izgara Dana Kontrfile Dilimleri',
        description: 'Kabak polenta ve karamelize soğan sos.',
        price: 1200,
        currency: 'TRY',
        imageUrl: null,
        tags: [],
        allergens: [],
        dietaryFlags: [],
        sortOrder: 7,
      },
    ],
  },
];

/**
 * Menu for a given locale: the Turkish structure with the locale's text overlay
 * applied. Non-text fields (price, tags, allergens, sortOrder) are always taken
 * from the TR source. Missing translations fall back to the Turkish text.
 */
export function getLocalMenu(locale: Locale): MenuCategory[] {
  if (locale === defaultLocale) return menuCategories;
  const overlay = menuTextByLocale[locale];
  if (!overlay) return menuCategories;

  return menuCategories.map((category) => {
    const catText = overlay.categories[category.id];
    return {
      ...category,
      name: catText?.name ?? category.name,
      description: catText?.description ?? category.description,
      items: category.items.map((item) => {
        const itemText = overlay.items[item.id];
        return {
          ...item,
          name: itemText?.name ?? item.name,
          description: itemText?.description ?? item.description,
        };
      }),
    };
  });
}

/** Localised service note (falls back to the Turkish original). */
export function getMenuServiceNote(locale: Locale): string {
  return menuNotesByLocale[locale]?.serviceNote ?? MENU_SERVICE_NOTE;
}

/** Localised wine-menu notice (falls back to the Turkish original). */
export function getWineMenuNotice(locale: Locale): string {
  return menuNotesByLocale[locale]?.wineNotice ?? WINE_MENU_NOTICE;
}
