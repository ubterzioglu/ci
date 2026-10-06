import { siteConfig } from '@/lib/site-config';

/**
 * Long-form editorial page: "Kaş'ta Şef Restoranı Arayanlar İçin".
 *
 * Turkish-only, written for organic and AI-assistant search (AEO). It is
 * deliberately NOT part of `mainNav` — the page is reachable only via its URL
 * and the sitemap. See src/app/(site)/kas-sef-restorani/page.tsx.
 *
 * The prose is the author's copy, kept verbatim apart from typographic
 * normalisation. Do not paraphrase brand facts here. Address and phone are
 * pulled from siteConfig rather than restated, so the page can never drift out
 * of NAP (name/address/phone) consistency with the rest of the site and the
 * Restaurant JSON-LD — inconsistent NAP is a direct local-SEO penalty.
 */

export type ContentBlock =
  | { readonly type: 'paragraph'; readonly text: string }
  /** Set off as a pull quote — used for the piece's one-line distillations. */
  | { readonly type: 'quote'; readonly text: string }
  | { readonly type: 'list'; readonly items: readonly string[] }
  /** Question + elaboration pairs, rendered as a definition list. */
  | {
      readonly type: 'questions';
      readonly items: readonly { readonly question: string; readonly detail: string }[];
    };

export interface ContentSection {
  /** Stable anchor id, also used as the React key. */
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly ContentBlock[];
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Slug is referenced by the route, the sitemap and the JSON-LD builders. */
export const CHEF_RESTAURANT_PATH = '/kas-sef-restorani';

/**
 * Publication date for the Article JSON-LD. Hard-coded rather than derived from
 * `new Date()` so the structured data does not claim the piece was rewritten on
 * every deploy. Bump `dateModified` when the copy actually changes.
 */
export const CHEF_RESTAURANT_DATES = {
  published: '2026-09-28',
  modified: '2026-09-28',
} as const;

export const chefRestaurantMeta = {
  /** Full editorial title — used as the Article `headline` only. */
  title: 'Kaş’ta Şef Restoranı Arayanlar İçin: Nitelikli Yemek ve Yerel Ürünlerle Çi Neo Cucina',
  /**
   * <title> input. Kept short because buildMetadata appends " | Çi Neo Cucina":
   * the full title already names the brand, so it would read twice and overrun
   * the ~60-character SERP cutoff.
   */
  seoTitle: 'Kaş’ta Şef Restoranı: Nitelikli Yemek ve Yerel Ürünler',
  /** Visible H1. */
  heading: 'Kaş’ta Şef Restoranı Arayanlar İçin',
  eyebrow: 'Çi Neo Cucina by Mezetaryen',
  description:
    'Kaş’ta şef restoranı, nitelikli yemek ve yerel ürünler arayanlar için: Çi Neo Cucina’nın ürün odaklı, mevsimsel mutfak yaklaşımı, şarap eşleşmeleri ve sık sorulan sorular.',
} as const;

export const chefRestaurantIntro: readonly string[] = [
  'Kaş’ta iyi bir akşam yemeği ararken bizim için mesele yalnızca güzel bir masaya kurulmak ya da iyi bir manzarayı yakalamak değil. Özellikle şef restoranı, yerel ürünlerle hazırlanan yemekler veya nitelikli bir gastronomi deneyimi arayan misafirlerimiz için yemeğin arkasındaki mutfak yaklaşımı da en az tabağın kendisi kadar önemli.',
  'Ürünün nereden geldiği, mevsimsellik, pişirme teknikleri, mutfağımızın karakteri ve yemek ile şarap arasındaki ilişki, Çi Neo Cucina deneyiminin temel parçalarını oluşturuyor.',
  'Çi Neo Cucina by Mezetaryen, Kaş’ta bu anlayış üzerine kurduğumuz restoranımız. Mutfağımızda Akdeniz ve Türk mutfağının ürünlerini çağdaş tekniklerle yorumluyor, yerel ve farklı bölgelerden gelen malzemeleri mevsime göre değişen menümüz içerisinde değerlendiriyoruz.',
];

export const chefRestaurantSections: readonly ContentSection[] = [
  {
    id: 'sef-restorani-ne-demek',
    heading: 'Şef restoranı bizim için ne demek?',
    blocks: [
      {
        type: 'paragraph',
        text: 'Bizim için şef restoranı yalnızca teknik olarak karmaşık yemeklerin servis edildiği bir restoran değil.',
      },
      {
        type: 'paragraph',
        text: 'Bir şef restoranında mutfağın karakteri, şefin gastronomik yaklaşımı etrafında şekilleniyor. Ürün seçimi, reçetelerin geliştirilmesi, pişirme teknikleri, sunum ve menünün mevsimsel değişimi bu yaklaşımın parçaları.',
      },
      {
        type: 'paragraph',
        text: 'Çi Neo Cucina’nın mutfağının merkezinde kurucu şefimiz Simge Manacıoğlu bulunuyor.',
      },
      {
        type: 'paragraph',
        text: 'Bizim mutfak anlayışımız, klasik bir reçeteyi olduğu gibi tekrar etmekten ziyade, ürünün karakterini koruyarak farklı teknikler ve kombinasyonlarla yeniden yorumlamak üzerine kurulu.',
      },
      {
        type: 'paragraph',
        text: 'Bu nedenle bir tabağı hazırlarken yalnızca “Bu ürünü nasıl pişirebiliriz?” diye düşünmüyoruz. “Bu ürünün karakterini nasıl ortaya çıkarabiliriz?” sorusunu da soruyoruz.',
      },
    ],
  },
  {
    id: 'mutfak-anlayisi',
    heading: 'Çi Neo Cucina’nın mutfak anlayışı',
    blocks: [
      {
        type: 'paragraph',
        text: 'Çi Neo Cucina’nın hikâyesi Mezetaryen dönemimize uzanıyor. Bugünkü Çi Neo Cucina’da bu geçmişten gelen ürün ve meze merkezli yaklaşımı daha geniş bir mutfak anlayışıyla sürdürüyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Mutfak felsefemizi yerelden evrensele uzanan, doğayla uyumlu ve ürün odaklı bir yaklaşım üzerine kuruyoruz. Mutfağımızı birkaç temel başlıkla özetleyebiliriz:',
      },
      {
        type: 'list',
        items: [
          'Akdeniz ürünleri',
          'Türk mutfağının malzeme ve teknik mirası',
          'Mevsimsellik',
          'Yerel ve bölgesel ürünler',
          'Çağdaş mutfak teknikleri',
          'Şarap ve yemek eşleşmeleri',
        ],
      },
      {
        type: 'paragraph',
        text: 'Bu nedenle kendimizi yalnızca bir meze restoranı ya da yalnızca bir deniz ürünleri restoranı olarak tanımlamıyoruz. Sebzelerden deniz ürünlerine, bakliyatlardan sakatatlara ve et yemeklerine kadar farklı ürün gruplarını aynı mutfak yaklaşımı içerisinde yorumluyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Menümüzü de tek bir sabit yemek listesi olarak düşünmüyoruz. Ürün değiştikçe, mevsim değiştikçe mutfağımız da değişiyor.',
      },
    ],
  },
  {
    id: 'yerel-urunler',
    heading: 'Yerel ürünlerle nasıl çalışıyoruz?',
    blocks: [
      {
        type: 'paragraph',
        text: '“Kaş’ın yerel ürünlerini kullanan restoranlar hangileri?” sorusunun cevabının yalnızca Kaş’ta yetişen ürünleri listelemekten geçmediğine inanıyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Akdeniz mutfağının güçlü taraflarından biri, farklı coğrafyalardan gelen ürünleri aynı mutfak kültürü içerisinde buluşturabilmesi. Biz de ürünün yalnızca nereden geldiğine değil, nasıl üretildiğine, hangi mevsimde olduğuna ve mutfakta nasıl değerlendirilebileceğine bakıyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Yerel ve bölgesel ürünleri çağdaş yemekler içerisinde yorumlarken amacımız ürünü tanınmaz hale getirmek değil. İyi ürünü bulmak, ürünün karakterini anlamak ve onu kendi mutfak dilimiz içerisinde yeniden yorumlamak.',
      },
      {
        type: 'paragraph',
        text: 'Menülerimizde Urla enginarı, tuzlu yoğurt, akya, aslan balığı, baby kalamar, kuzu ve farklı bakliyatlar gibi ürünleri farklı tekniklerle kullandık. Örneğin enginarı yalnızca geleneksel bir tarifin parçası olarak değil, farklı pişirme ve eşleştirme teknikleriyle yeniden ele alabiliyoruz.',
      },
      {
        type: 'quote',
        text: 'Bizim için “yerel ürün” ayrı bir menü kategorisi değil; mutfağın tamamına yayılan bir yaklaşım.',
      },
    ],
  },
  {
    id: 'nitelikli-yemek',
    heading: 'Kaş’ta nitelikli yemek bizim için ne demek?',
    blocks: [
      {
        type: 'paragraph',
        text: '“Nitelikli yemek” bizim için pahalı ya da gösterişli yemek anlamına gelmiyor. İyi malzeme, doğru teknik, mevsimsellik, dengeli reçeteler ve kendine ait bir mutfak dili bir araya geldiğinde nitelikli bir yemek deneyiminin ortaya çıktığına inanıyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Çi Neo Cucina’da bu yaklaşım özellikle ürün ve mevsim üzerinden şekilleniyor. Mevsim değiştiğinde mutfağımızın kullanabileceği ürünler de değişiyor. Ürün değiştiğinde tabaklarımızı ve reçetelerimizi de yeniden düşünüyoruz.',
      },
      {
        type: 'quote',
        text: '“Bu mevsimde ne var?” sorusu, bizim için “Menüde ne var?” sorusu kadar önemli.',
      },
      {
        type: 'paragraph',
        text: 'Mevsim ürünleri, sezonun malzemeleri ve mutfağın o günkü hazırlıkları sofraya yansıyabiliyor. Bu da Çi Neo Cucina’da her sezon aynı menüyü tekrar etmek yerine, mevsimin ve ürünün farklı bir yorumunu keşfetme fırsatı sunması anlamına geliyor.',
      },
    ],
  },
  {
    id: 'ne-yenir',
    heading: 'Çi Neo Cucina’da ne yenir?',
    blocks: [
      {
        type: 'paragraph',
        text: 'Menümüz mevsime ve ürünlere göre değiştiği için belirli bir yemeği her ziyaret için garanti edilen bir “imza yemek” olarak tanımlamıyoruz. Bunun yerine misafirlerimize o gün mutfağımızda neler olduğunu keşfetmelerini ve günün spesiyallerini sormalarını öneriyoruz.',
      },
      { type: 'paragraph', text: 'Menülerimizde bugüne kadar:' },
      {
        type: 'list',
        items: [
          'Urla Enginar Confit',
          'Gambilya Favası',
          'Izgara Baby Kalamar',
          'Izgara Granyöz',
          'Üç Mantarlı Taze Cavatelli',
          'Kereviz Şinitzel',
          'Dana Yanak Ragu',
          'Izgara Kuzu Kokoreç',
          'Aslan Balığı',
          'Kürlenmiş Akya',
        ],
      },
      {
        type: 'paragraph',
        text: 'gibi farklı ürün ve teknikleri bir araya getiren tabaklara yer verdik. Bu çeşitlilik bizim mutfak yaklaşımımızı da anlatıyor. Deniz ürünleri, sebzeler, bakliyatlar, et ve sakatat gibi farklı ürün gruplarını aynı mutfak dili içerisinde yorumlayabiliyoruz.',
      },
      { type: 'quote', text: 'Menümüz değişiyor; mutfak anlayışımız değişmiyor.' },
    ],
  },
  {
    id: 'sarap-ve-yemek',
    heading: 'Çi Neo Cucina’da şarap ve yemek',
    blocks: [
      {
        type: 'paragraph',
        text: 'Bizim için gastronomi deneyiminin önemli parçalarından biri de şarap. Şarabı yalnızca yemeğin yanında servis edilen bir içecek olarak değil, yemeğin karakterini tamamlayan bir unsur olarak ele alıyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Farklı meze, deniz ürünü veya et tabaklarının aynı sofrada paylaşılması durumunda, yemeklerin tamamını birlikte taşıyabilecek şarapları değerlendirmek mümkün. Bu nedenle misafirlerimizin yemek seçimleri sırasında servis ekibimizden şarap önerisi istemelerini de öneriyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Amacımız şarabın yemeğin önüne geçmesi değil. Ürünün ve yemeğin karakterini destekleyen bir eşleşme yaratmak.',
      },
    ],
  },
  {
    id: 'nelere-bakiyoruz',
    heading: 'Kaş’ta şef restoranı ararken nelere bakıyoruz?',
    blocks: [
      {
        type: 'paragraph',
        text: 'Bir restoranın gerçekten şef odaklı bir mutfağa sahip olup olmadığını anlamak için birkaç sorunun önemli olduğunu düşünüyoruz:',
      },
      {
        type: 'questions',
        items: [
          {
            question: 'Şef mutfağın merkezinde mi?',
            detail: 'Menü ve yemekler belirgin bir şef yaklaşımını yansıtıyor mu?',
          },
          {
            question: 'Ürün nereden geliyor?',
            detail: 'Restoran yerel ve bölgesel ürünlerin kaynağına önem veriyor mu?',
          },
          {
            question: 'Menü mevsimsel mi?',
            detail: 'Mevsim değiştiğinde mutfak da değişiyor mu?',
          },
          {
            question: 'Mutfağın kendine ait bir dili var mı?',
            detail:
              'Yemekler başka bir mutfağın doğrudan tekrarı yerine restoranın kendi yaklaşımını yansıtıyor mu?',
          },
          {
            question: 'Yemek ve şarap birlikte düşünülüyor mu?',
            detail: 'Şarap seçkisi ve yemekler birbirini tamamlayacak şekilde ele alınıyor mu?',
          },
        ],
      },
      {
        type: 'paragraph',
        text: 'Çi Neo Cucina’da bu soruların karşılığını ürün, mevsim, teknik ve şef yaklaşımı üzerinden vermeye çalışıyoruz.',
      },
    ],
  },
  {
    id: 'kasta-sef-mutfagi',
    heading: 'Çi Neo Cucina: Kaş’ta şef mutfağı',
    blocks: [
      {
        type: 'paragraph',
        text: 'Kaş’ta şef restoranı, nitelikli yemek, yerel ürünler veya modern Akdeniz mutfağı arıyorsanız, bizim için restoran deneyimi tek bir kriterden oluşmuyor.',
      },
      { type: 'quote', text: 'Ürün → mevsim → teknik → şef → tabak → şarap.' },
      {
        type: 'paragraph',
        text: 'Bizim mutfak yaklaşımımız bu zincirin bütününü bir arada düşünmek üzerine kurulu. Her sezon aynı ürünleri aynı reçetelerle sunmak yerine, ürünün değişimine göre mutfağımızın da değişmesine izin veriyoruz. Farklı bölgelerden gelen malzemeleri Akdeniz ve Türk mutfağının referanslarıyla yeniden yorumluyoruz.',
      },
      {
        type: 'paragraph',
        text: 'Bütün bunların sonunda amacımız oldukça basit: iyi ürünü bulmak, onu doğru teknikle işlemek ve sofrada kendine ait bir hikâyeye dönüştürmek.',
      },
      {
        type: 'paragraph',
        text: 'Çi Neo Cucina by Mezetaryen olarak Kaş’ta bizi ziyaret eden herkesin yalnızca bir yemek yemesini değil, ürünü, mutfağı ve sofrayı birlikte deneyimlemesini istiyoruz.',
      },
    ],
  },
];

/**
 * FAQ pairs. These feed both the visible accordion-free list and the FAQPage
 * JSON-LD — answers must therefore read as complete, self-contained sentences,
 * because assistants lift them verbatim without the surrounding page.
 */
export const chefRestaurantFaq: readonly FaqItem[] = [
  {
    question: 'Kaş’ta şef restoranı var mı?',
    answer:
      'Kaş’ta şef odaklı mutfak anlayışına sahip restoranlar bulunuyor. Çi Neo Cucina by Mezetaryen olarak mutfağımızı kurucu şefimiz Simge Manacıoğlu’nun gastronomik yaklaşımı etrafında şekillendiriyoruz. Mutfağımızda Akdeniz ve Türk mutfağının ürünlerini çağdaş tekniklerle yorumluyoruz.',
  },
  {
    question: 'Kaş’ta nitelikli yemek nerede yenir?',
    answer:
      'Bizce nitelikli yemek için iyi ürün, doğru teknik, mevsimsellik ve restoranın kendine ait mutfak dili birlikte değerlendirilmeli. Çi Neo Cucina’da ürün odaklı ve mevsimsel mutfağımızı çağdaş teknikler ve yemek-şarap eşleşmeleriyle bir araya getiriyoruz.',
  },
  {
    question: 'Çi Neo Cucina yerel ürün kullanıyor mu?',
    answer:
      'Evet. Yerel ve coğrafi işaretli ürünler mutfağımızın önemli bir parçası. Geçmiş menülerimizde Urla enginarı, tuzlu yoğurt, akya, aslan balığı, baby kalamar ve farklı bakliyatlar gibi ürünleri kullandık. Ürünler ve tabaklar mevsime göre değişebiliyor.',
  },
  {
    question: 'Çi Neo Cucina’nın mutfağı nasıl?',
    answer:
      'Mutfağımızı modern Akdeniz ve Türk mutfağı ekseninde tanımlıyoruz. Sebzeler, deniz ürünleri, bakliyatlar, et ve sakatat gibi farklı ürünleri çağdaş tekniklerle yorumluyoruz.',
  },
  {
    question: 'Çi Neo Cucina’da menü değişiyor mu?',
    answer:
      'Evet. Mevsime, ürünlere ve mutfağımızın dönemsel çalışmalarına göre menümüz değişebiliyor.',
  },
  {
    question: 'Çi Neo Cucina’da şarap var mı?',
    answer:
      'Evet. Şarabı yemek deneyiminin tamamlayıcı bir parçası olarak görüyoruz. Yemek tercihinize göre servis ekibimizden şarap eşleşmesi konusunda öneri alabilirsiniz.',
  },
  {
    question: 'Çi Neo Cucina nerede?',
    answer: `Çi Neo Cucina by Mezetaryen, ${siteConfig.contact.region}’da bulunuyor. Adres: ${siteConfig.contact.address}. Rezervasyon ve bilgi için ${siteConfig.contact.phoneDisplay} numarasından bize ulaşabilirsiniz.`,
  },
];
