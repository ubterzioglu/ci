import type { PageContent } from '@/lib/types';

/**
 * Local page content — extracted from the Wix export (ref/content/pages/*.md),
 * cleaned for spacing, capitalisation and obvious template artifacts.
 *
 * Used as the development fallback when Supabase is not configured, and as the
 * source for the database seed. Brand facts (chef bio, story, vision) are
 * preserved verbatim — do not invent biographies or facts.
 */

export const aboutContent = {
  title: 'Hakkımızda',
  intro: {
    heading: 'Dinginliğin ve Lezzetin Buluştuğu Yer',
    paragraphs: [
      'Her tabakta bir zamansızlık var; bir zeytinliğin rüzgârını, bir taş sokağın serinliğini ve eski bir tarif defterinin mütevazı cümlelerini taşıyan bir zamansızlık…',
      'Çi Neo Cucina, Akdeniz’in ve Anadolu’nun en sade ama derin tatlarından ilham alır. Malzemenin doğallığını, sofranın samimiyetini ve paylaşmanın dingin mutluluğunu önemseriz. Her bir reçetemiz; mevsimlerden, denizden, topraktan ve insan hikâyelerinden bir iz taşır.',
      'Biz bir restoran değil; doğanın ve geleneğin sesiyle örülmüş bir masa etrafında buluşmanın adı olmak istedik.',
      'Bu yüzden Çi Neo Cucina yalnızca yemek yenilen bir yer değil; her lokmada zamansız bir dostluk, her yudumda sessiz bir Akdeniz esintisi barındırır.',
      'Hoş geldiniz. Masamızda yeriniz hazır.',
    ],
  },
  vision: {
    heading: 'Vizyonumuz',
    paragraphs: [
      'Geleceğin gastronomi anlayışında, gürültüden uzak; anlamlı, sürdürülebilir ve dokunaklı bir mutfak dili inşa etmek istiyoruz.',
      'Çi Neo Cucina’nın vizyonu; yerelden evrensele uzanan, doğayı taklit etmeyen ama onunla uyumlu bir mutfak felsefesini dünyayla paylaşmak.',
      'Zamanla bir restoran olmaktan öteye geçip bir duruşa, bir yaşam biçimine dönüşmek en büyük hayalimiz.',
    ],
  },
  chef: {
    heading: 'Şefle Tanışalım',
    name: 'Simge Manacıoğlu',
    paragraphs: [
      'Simge Manacıoğlu, Yeditepe Üniversitesi Siyaset Bilimi ve Uluslararası İlişkiler bölümünden mezun olduktan sonra kurumsal hayata adım attı. Bu süreçte MBA derecesini tamamladıysa da kendini bu dünyanın bir parçası gibi hissedemedi.',
      '30 yaşında, 2003’teki ilk Kaş seyahatinden beri kurduğu şarap evi hayalini eşi ve annesinin desteğiyle gerçeğe dönüştürmek üzere yola çıktı. Gastronomiye olan ilgisi, 2014 yılında EKS Mutfak Akademisi’ndeki eğitimiyle profesyonel bir yön kazandı; bu eğitimi dönem birincisi olarak tamamladı.',
      '2016’da Kaş’a taşınarak Sumanu Şarap Evi’nde şef olarak çalışmaya başladı ve mutfak becerilerini derinleştirdi. 2018’de eşi Tolga Manacıoğlu’yla kurduğu Mezeteryan adlı restoranıyla Türkiye’de bir ilke imza atarak aslan balığını menüsüne dâhil etti ve sürdürülebilirlik alanında farkındalık yarattı. Dört yıl boyunca UNDP, WWF ve Akdeniz Koruma gibi önemli kuruluşlarla iş birlikleri yürüttü.',
      '2024 itibarıyla, hayatına neşe ve ilhamla katılan kızı Çağıl İda’nın ismini verdiği Çi Neo Cucina ile yaratıcı ve sürdürülebilir gastronomi anlayışını paylaşmaya devam ediyor.',
    ],
  },
  team: {
    heading: 'Ekibimiz',
    members: ['Simge Manacıoğlu', 'Lisa Rose', 'Mutfak Ekibi'],
    note: '2025 Çi Ailesi',
  },
} as const;

export const homeContent = {
  hero: {
    title: 'Çi Neo Cucina',
    subtitle: 'Doğal malzemeler, zamansız bir mutfak dili.',
    description: '“Eski” ve “Yeni” Kaş arasında, Akdeniz ve Anadolu’dan ilham alan bir sofra.',
  },
  menusTeaser: [
    {
      key: 'ana-menu',
      title: 'Ana Menü',
      description: 'Üç ana başlıkta; kimi yenilikçi, kimi yepyeni reçeteler.',
      href: '/menu',
    },
    {
      key: 'gunun-spesiyali',
      title: 'Günün Spesiyali',
      description:
        'Lütfen sorunuz: dönemsel olarak misafirlerimizin damaklarıyla buluşan özel lezzetler.',
      href: '/menu',
    },
    {
      key: 'sarap-menusu',
      title: 'Şarap Menüsü',
      description:
        'Büyük oranda yerel üreticilerden oluşan zengin kavımızda her damağa uygun bir tat var.',
      href: '/menu',
    },
  ],
  chefsTable: {
    heading: 'Chef’s Table',
    body: 'Özel etkinlikleriniz için lütfen iletişime geçiniz.',
  },
  /**
   * Premium "deneyim" showcase on the home page (ExperienceShowcase section).
   *
   * `icon` is a discriminator resolved to an inline SVG in the component (keeps
   * this content file JSX-free).
   *
   * NOTE on facts: only "Chef's Table" is a confirmed brand fact (see
   * `chefsTable` above and the /experiences page, which the live Wix site
   * presents as "experiences by request"). Two earlier placeholder cards
   * ("Şarap Eşleştirme", "Bahçe Akşamları") were removed because they were NOT
   * verified brand facts (CLAUDE.md "don't fabricate facts"; confirmed against
   * the 2026 site crawl, which lists no live experiences). Add cards back here
   * only when the restaurant confirms a real, bookable experience.
   */
  experiences: [
    {
      key: 'chefs-table',
      icon: 'plate',
      title: 'Chef’s Table',
      description:
        'Şefin sofrasında, mevsimin en taze malzemeleriyle kişiye özel bir menü deneyimi.',
      href: '/reservations',
    },
  ],
} as const;

/** Page rows for the database seed (markdown rendered server-side). */
export const seedPages: PageContent[] = [
  {
    slug: 'home',
    title: 'Ana Sayfa',
    excerpt: homeContent.hero.description,
    contentMd: null,
    seoTitle: 'Ana Sayfa | Çi Neo Cucina',
    seoDescription:
      'Kaş’ta doğal malzemeler, Akdeniz ve Anadolu’dan ilham alan zamansız mutfak diliyle Çi Neo Cucina.',
    ogImageUrl: null,
  },
  {
    slug: 'about',
    title: 'Hakkımızda',
    excerpt: aboutContent.intro.paragraphs[0] ?? null,
    contentMd: null,
    seoTitle: 'Hakkımızda | Çi Neo Cucina',
    seoDescription:
      'Çi Neo Cucina’nın dinginlik, sürdürülebilirlik, yerel malzeme ve Akdeniz sofrası odaklı hikâyesi.',
    ogImageUrl: null,
  },
  {
    slug: 'menu',
    title: 'Menü',
    excerpt: 'Topraktan, denizden ve otlaktan lezzetler.',
    contentMd: null,
    seoTitle: 'Menü | Çi Neo Cucina',
    seoDescription:
      'Çi Neo Cucina ana menüsü: topraktan, denizden ve otlaktan lezzetler; yerel üreticilerden şarap seçkisi.',
    ogImageUrl: null,
  },
  {
    slug: 'reservations',
    title: 'Rezervasyonlar',
    excerpt: 'Ayrıntıları seçin, sizin için en iyi yerleri bulmaya çalışalım.',
    contentMd: null,
    seoTitle: 'Rezervasyonlar | Çi Neo Cucina',
    seoDescription:
      'Çi Neo Cucina’da rezervasyon talebi oluşturun; kişi sayısı, tarih ve saat bilgilerinizi paylaşın.',
    ogImageUrl: null,
  },
  {
    slug: 'experiences',
    title: 'Deneyimler',
    excerpt: 'Özel deneyimler ve etkinlikler için bizimle iletişime geçin.',
    contentMd: null,
    seoTitle: 'Deneyimler | Çi Neo Cucina',
    seoDescription: 'Çi Neo Cucina deneyimleri ve özel etkinlik duyuruları.',
    ogImageUrl: null,
  },
];
