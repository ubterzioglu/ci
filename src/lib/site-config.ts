/**
 * Çi Neo Cucina — central site configuration.
 *
 * Single source of truth for brand facts, contact details, and navigation.
 * All values are sourced from the Wix export package (see /ref). Items that
 * are NOT present in the source are marked `null` and tracked in
 * TODO_PANEL_EXPORTS.md — do not fabricate them.
 */

export const siteConfig = {
  name: 'Çi Neo Cucina',
  shortName: 'Çi Neo Cucina',
  hashtag: '#CiNeoCucina',
  tagline: 'Doğal malzemeler, zamansız bir mutfak dili.',
  description:
    'Kaş’ta doğal malzemeler, Akdeniz ve Anadolu’dan ilham alan zamansız mutfak diliyle Çi Neo Cucina.',

  /**
   * Public site URL — overridden by NEXT_PUBLIC_SITE_URL at runtime.
   * Fallback is the TEMPORARY domain (notyetbro.club). Switch back to
   * https://www.cineocucina.com when the primary domain goes live.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notyetbro.club',

  locale: 'tr_TR',
  defaultLocale: 'tr' as const,

  /**
   * Default Open Graph / social-share image (absolute path under /public).
   * Points at an existing imported brand photo until a purpose-built 1200×630
   * og-default.jpg is produced. Single source of truth for SEO helpers.
   */
  ogDefaultImage: '/images/imported/home-hero-table.jpg',

  contact: {
    phoneDisplay: '+90 544 687 05 28',
    phoneE164: '+905446870528',
    email: 'cineo.cucina@gmail.com',
    region: 'Kaş, Antalya',
    // Confirmed via Google Maps business listing (Çi neo cucina by mezetaryen).
    address: 'Andifli Mah., Uğur Mumcu Cad. No:23, 07580 Kaş/Antalya' as string | null,
    mapsUrl: 'https://maps.app.goo.gl/ucWq9wqB8Xb3LZXv9' as string | null,
  },

  /**
   * Geo coordinates for local SEO (Restaurant JSON-LD `geo` + `hasMap`).
   * Taken from the Google Maps business pin (the `!3d…!4d…` segment of the
   * place URL, not the `@…` camera centre).
   */
  geo: {
    latitude: 36.202132 as number | null,
    longitude: 29.6366394 as number | null,
  },

  /**
   * Opening hours. `label`/`value` drive the human-readable display; `days`
   * (schema.org DayOfWeek) + opens/closes drive the JSON-LD
   * OpeningHoursSpecification. Service runs into the next day (closes 02:00),
   * which schema.org handles fine. Closed Sunday.
   */
  hours: [
    {
      label: 'Pazartesi – Cumartesi',
      value: '17:00 – 02:00',
      days: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ] as const,
      opens: '17:00',
      closes: '02:00',
    },
  ] as { label: string; value: string; days: readonly string[]; opens: string; closes: string }[] | null,

  /** Social links — NOT present in the public source (only generic icons). */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  reservationNote: 'Özel etkinlikleriniz için lütfen iletişime geçiniz.',
} as const;

/** Primary navigation. Slugs preserve SEO where the old Wix slug differed. */
export interface NavItem {
  labelTr: string;
  labelEn: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { labelTr: 'Ana Sayfa', labelEn: 'Home', href: '/' },
  { labelTr: 'Menü', labelEn: 'Menu', href: '/menu' },
  { labelTr: 'Hakkımızda', labelEn: 'About', href: '/about' },
  { labelTr: 'Deneyimler', labelEn: 'Experiences', href: '/experiences' },
  { labelTr: 'Rezervasyon', labelEn: 'Reservations', href: '/reservations' },
  { labelTr: 'İletişim', labelEn: 'Contact', href: '/contact' },
];

export const footerLegalNav: NavItem[] = [
  { labelTr: 'İmpressum', labelEn: 'Impressum', href: '/impressum' },
  { labelTr: 'Gizlilik', labelEn: 'Privacy', href: '/datenschutz' },
];

export const PRIMARY_CTA = {
  labelTr: 'Rezervasyon Talep Et',
  labelEn: 'Reserve a Table',
  href: '/reservations',
} as const;
