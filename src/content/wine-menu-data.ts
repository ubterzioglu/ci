import type { Locale } from '@/lib/i18n/config';
import type { MenuCategory, MenuItem } from '@/lib/types';

type WineSeed = {
  id: string;
  name: string;
  description: string;
  bottle?: number;
  glass?: number;
  coravin?: boolean;
};

function wine(seed: WineSeed, sortOrder: number): MenuItem {
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    price: seed.bottle ?? null,
    glassPrice: seed.glass ?? null,
    isCoravin: seed.coravin ?? false,
    currency: 'TRY',
    imageUrl: null,
    tags: [],
    allergens: [],
    dietaryFlags: [],
    sortOrder,
  };
}

function wines(seeds: WineSeed[]): MenuItem[] {
  return seeds.map((seed, index) => wine(seed, index + 1));
}

/**
 * Canonical transcription of IMG-20260916-WA0012.jpg.
 * `price` is the bottle/menu price; `glassPrice` is the glass/8 cl serving.
 * The crossed-out Yaban Kolektif bottle price is intentionally replaced by the
 * handwritten current price (₺4.200).
 */
export const wineMenuCategories: MenuCategory[] = [
  {
    id: 'wine-white',
    name: 'Beyaz Şaraplar',
    slug: 'beyaz-saraplar',
    description: null,
    sortOrder: 1,
    items: wines([
      { id: 'white-sofra-sarabi', name: 'Sofra Şarabı', description: 'House Wine', glass: 480 },
      {
        id: 'white-heraki-delta-v',
        name: 'Heraki Delta V',
        description: 'Sultaniye | Denizli Çal',
        bottle: 2700,
      },
      { id: 'white-hus-emir', name: 'HUS', description: 'Emir | Kapadokya', bottle: 2800 },
      {
        id: 'white-kayra-allure',
        name: 'Kayra Allure',
        description: 'Crispy Chardonnay | Tekirdağ',
        bottle: 2350,
      },
      {
        id: 'white-kayra-old-wine',
        name: 'Kayra Old Wine',
        description: 'Semillion | Şarköy',
        bottle: 2950,
      },
      {
        id: 'white-kuzubag-calkarasi',
        name: 'Kuzubağ',
        description: 'Çalkarası | Denizli',
        bottle: 2400,
      },
      {
        id: 'white-messashuna-rkatsitelli-sm',
        name: 'Messashuna Rkatsitelli SM',
        description: 'Rkatsitelli | Artvin',
        glass: 1150,
        bottle: 4500,
        coravin: true,
      },
      {
        id: 'white-nif-aegean',
        name: 'Nif Bağları Aegean',
        description: 'Viognier / Narince / Solaris | İzmir',
        glass: 625,
        bottle: 2500,
      },
      {
        id: 'white-nif-bornova-misket',
        name: 'Nif Bağları',
        description: 'Bornova Misket | İzmir',
        bottle: 3500,
      },
      {
        id: 'white-pamukkale-nodus',
        name: 'Pamukkale Nodus',
        description: 'Narince | Güney - Denizli',
        bottle: 2650,
      },
      {
        id: 'white-ucmakdere-firuze-chardonnay',
        name: 'Uçmakdere Firuze',
        description: 'Chardonnay | Şarköy',
        bottle: 2800,
      },
      {
        id: 'white-umurbey-sauvignon-blanc',
        name: 'Umurbey',
        description: 'Sauvignon Blanc | Tekirdağ',
        bottle: 2500,
      },
      {
        id: 'white-vinkara-atelier-blanc-de-noir',
        name: 'Vinkara Atelier Blanc De Noir',
        description: 'Kalecik Karası | Ankara',
        bottle: 2500,
      },
      {
        id: 'white-vinkara-atelier-hasandede',
        name: 'Vinkara Atelier',
        description: 'Hasandede | Ankara',
        glass: 625,
        bottle: 2500,
      },
      {
        id: 'white-vinkara-domi-sek',
        name: 'Vinkara Dömi-Sek',
        description: 'Misket | Ankara',
        bottle: 2500,
      },
      {
        id: 'white-yedi-bilgeler-khilon',
        name: 'Yedi Bilgeler Khilon',
        description: 'Sauvignon Blanc | Denizli Güney Plato',
        bottle: 3400,
      },
    ]),
  },
  {
    id: 'wine-rose',
    name: 'Pembe Şaraplar',
    slug: 'pembe-saraplar',
    description: null,
    sortOrder: 2,
    items: wines([
      { id: 'rose-sofra-sarabi', name: 'Sofra Şarabı', description: 'House Wine', glass: 480 },
      {
        id: 'rose-nif-montepulciano',
        name: 'Nif Bağları',
        description: 'Montepulciano | İzmir',
        bottle: 2900,
      },
      {
        id: 'rose-nif-aegean-sangiovese',
        name: 'Nif Bağları Aegean',
        description: 'Sangiovese | İzmir',
        glass: 625,
        bottle: 2500,
      },
      {
        id: 'rose-yedi-bilgeler-lasos',
        name: 'Yedi Bilgeler Lasos',
        description: 'Shiraz / Merlot / Petit Verdo | İzmir & Denizli',
        bottle: 3100,
      },
    ]),
  },
  {
    id: 'wine-sparkling',
    name: 'Köpüklü Şaraplar',
    slug: 'kopuklu-saraplar',
    description: null,
    sortOrder: 3,
    items: wines([
      {
        id: 'sparkling-pamukkale-mullier',
        name: 'Pamukkale Mullier 37,5 cl',
        description: 'Misket | Denizli',
        bottle: 1650,
      },
      {
        id: 'sparkling-vinkara-yasasin',
        name: 'Vinkara Yaşasın',
        description: 'Kalecik Karası | Ankara',
        glass: 800,
        bottle: 4800,
      },
      {
        id: 'sparkling-riondo-prosecco',
        name: 'Riondo Prosecco DOC Extra Dry',
        description: 'Glera | Venezie & İtalya',
        bottle: 3000,
      },
      {
        id: 'sparkling-zardetto-prosecco',
        name: 'Zardetto Brut Prosecco DOC',
        description: 'Glera / Trebbiano | Venezie & İtalya',
        bottle: 3500,
      },
    ]),
  },
  {
    id: 'wine-red',
    name: 'Kırmızı Şaraplar',
    slug: 'kirmizi-saraplar',
    description: null,
    sortOrder: 4,
    items: wines([
      { id: 'red-sofra-sarabi', name: 'Sofra Şarabı', description: 'House Wine', glass: 480 },
      {
        id: 'red-hus-juan',
        name: 'HUS Juan',
        description: 'Carignan | Seferihisar Beyler',
        glass: 1000,
        bottle: 3800,
        coravin: true,
      },
      {
        id: 'red-hus-okuzgozu-bogazkere',
        name: 'HUS',
        description: 'Öküzgözü Boğazkere | Denizli-Çal',
        bottle: 2600,
      },
      {
        id: 'red-kayra-allure',
        name: 'Kayra Allure',
        description: 'Kalecik Karası | Tekirdağ',
        bottle: 2400,
      },
      {
        id: 'red-kayra-versus-alpagut',
        name: 'Kayra Versus Alpagut',
        description: 'Öküzgözü | Elazığ',
        bottle: 2600,
      },
      {
        id: 'red-kocabag-leos',
        name: "Kocabağ Leo's",
        description: 'Cab. Sauv. / Boğazkere / Öküzgözü | Kapadokya & Ege',
        glass: 1150,
        bottle: 4500,
        coravin: true,
      },
      {
        id: 'red-kuzeybag-kosetevek',
        name: 'Kuzeybağ',
        description: 'Kösetevek | Elazığ - Koruk',
        bottle: 2600,
      },
      {
        id: 'red-maadra-pinot-noir',
        name: "Ma'Adra",
        description: 'Pinot Noir | Kuzey Ege - Gömeç',
        bottle: 2600,
      },
      {
        id: 'red-maadra-reserve',
        name: "Ma'Adra Reserve",
        description: 'Cabernet Sauvignon | Kuzey Ege - Gömeç',
        glass: 1100,
        bottle: 4000,
        coravin: true,
      },
      {
        id: 'red-messashuna-saperavi-sm',
        name: 'Messashuna Saperavi SM',
        description: 'Saperavi | Artvin',
        glass: 1150,
        bottle: 4500,
        coravin: true,
      },
      {
        id: 'red-nif-aegean',
        name: 'Nif Bağları Aegean',
        description: 'M. Pulciano / Shiraz / Sangiovese | İzmir',
        glass: 625,
        bottle: 2500,
      },
      {
        id: 'red-nif-sangiovese',
        name: 'Nif Bağları',
        description: 'Sangiovese | İzmir',
        bottle: 2400,
      },
      {
        id: 'red-nif-shiraz',
        name: 'Nif Bağları',
        description: 'Shiraz | İzmir',
        bottle: 2400,
      },
      {
        id: 'red-ucmakdere-firuze-merlot',
        name: 'Uçmakdere Firuze',
        description: 'Merlot | Şarköy',
        glass: 700,
        bottle: 2500,
        coravin: true,
      },
      {
        id: 'red-ucmakdere-firuze-cabernet',
        name: 'Uçmakdere Firuze',
        description: 'Cabernet Sauvignon | Şarköy',
        glass: 700,
        bottle: 2500,
        coravin: true,
      },
      {
        id: 'red-vinkara-grand-reserve',
        name: 'Vinkara Grand Reserve',
        description: 'Boğazkere | Ankara',
        glass: 1100,
        bottle: 4000,
        coravin: true,
      },
      {
        id: 'red-vinkara-reserve-blend',
        name: 'Vinkara Reserve',
        description: 'Cabernet Sauvignon / Merlot / Shiraz | Ankara',
        glass: 850,
        bottle: 3250,
        coravin: true,
      },
      {
        id: 'red-vinkara-reserve-kalecik-karasi',
        name: 'Vinkara Reserve',
        description: 'Kalecik Karası | Ankara',
        glass: 850,
        bottle: 3250,
        coravin: true,
      },
      {
        id: 'red-yaban-kolektif-ercis-karasi',
        name: 'Yaban Kolektif',
        description: 'Erciş Karası | Van',
        glass: 1000,
        bottle: 4200,
        coravin: true,
      },
      {
        id: 'red-yedi-bilgeler-salon-attica',
        name: 'Yedi Bilgeler Salon Attica',
        description: 'Malbec | İzmir',
        glass: 950,
        bottle: 3500,
        coravin: true,
      },
      {
        id: 'red-yedi-bilgeler-pythagoras',
        name: 'Yedi Bilgeler Pythagoras',
        description: 'Cab. Sauv. / Merlot / Cab. Franc / P. Verdot | İzmir',
        glass: 1100,
        bottle: 4800,
        coravin: true,
      },
      {
        id: 'red-casalforte-valpolicella',
        name: 'Casalforte Valpolicella Superiore DOC',
        description: 'Corvina / Corvinone / Rondinella | Veneto İtalya',
        glass: 800,
        bottle: 3000,
        coravin: true,
      },
      {
        id: 'red-dezzani-barolo',
        name: 'Dezzani Barolo San Carlo DOCG',
        description: 'Nebbiolo | Barolo İtalya',
        glass: 850,
        bottle: 3250,
        coravin: true,
      },
      {
        id: 'red-manieri-primitivo',
        name: 'Manieri Primitivo',
        description: 'Primitivo | Puglia İtalya',
        bottle: 2750,
      },
      {
        id: 'red-vina-bujanda-reserva',
        name: 'Vina Bujanda Reserva DOC',
        description: 'Tempranillo | Rioja İspanya',
        glass: 750,
        bottle: 2750,
        coravin: true,
      },
    ]),
  },
  {
    id: 'wine-liqueur',
    name: 'Likör Şarapları',
    slug: 'likor-saraplari',
    description: null,
    sortOrder: 5,
    items: wines([
      {
        id: 'liqueur-kayra-madre',
        name: 'Kayra Madre (8 cl)',
        description: 'Boğazkere / Öküzgözü',
        glass: 350,
      },
      {
        id: 'liqueur-kup-visno-mistel',
        name: 'Küp Vişno Mistel (8 cl)',
        description: 'Denizli',
        glass: 320,
      },
    ]),
  },
];

export const wineCategoryNamesByLocale: Record<Locale, Record<string, string>> = {
  tr: {},
  en: {
    'wine-white': 'White Wines',
    'wine-rose': 'Rosé Wines',
    'wine-sparkling': 'Sparkling Wines',
    'wine-red': 'Red Wines',
    'wine-liqueur': 'Liqueur Wines',
  },
  de: {
    'wine-white': 'Weißweine',
    'wine-rose': 'Roséweine',
    'wine-sparkling': 'Schaumweine',
    'wine-red': 'Rotweine',
    'wine-liqueur': 'Likörweine',
  },
  ru: {
    'wine-white': 'Белые вина',
    'wine-rose': 'Розовые вина',
    'wine-sparkling': 'Игристые вина',
    'wine-red': 'Красные вина',
    'wine-liqueur': 'Ликёрные вина',
  },
};

export interface WinePriceLabels {
  glass: string;
  bottle: string;
  coravin: string;
}

export const winePriceLabelsByLocale: Record<Locale, WinePriceLabels> = {
  tr: { glass: 'Kadeh', bottle: 'Şişe', coravin: 'Coravin ile kadeh servisi' },
  en: { glass: 'Glass', bottle: 'Bottle', coravin: 'Wine by the glass via Coravin' },
  de: { glass: 'Glas', bottle: 'Flasche', coravin: 'Glasweise mit Coravin' },
  ru: { glass: 'Бокал', bottle: 'Бутылка', coravin: 'Подача по бокалам с Coravin' },
};

export function getLocalWineMenu(locale: Locale): MenuCategory[] {
  const names = wineCategoryNamesByLocale[locale];
  return wineMenuCategories.map((category) => ({
    ...category,
    name: names[category.id] ?? category.name,
    items: category.items.map((item) => ({ ...item })),
  }));
}

export function getWinePriceLabels(locale: Locale): WinePriceLabels {
  return winePriceLabelsByLocale[locale];
}
