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

  contact: {
    phoneDisplay: '+90 544 687 05 28',
    phoneE164: '+905446870528',
    email: 'cineo.cucina@gmail.com',
    // Region present in brand story; precise street address NOT in source.
    region: 'Kaş, Antalya',
    // TODO(panel-export): exact street address + Google Maps link missing.
    address: null as string | null,
    mapsUrl: null as string | null,
  },

  /**
   * Opening hours — NOT present in the public source. The "18:00 – 23:00"
   * value below only appeared next to the (empty) wine menu, so it is shown
   * as an indicative service window, not confirmed opening hours.
   * TODO(panel-export): confirm real opening hours.
   */
  hours: null as { label: string; value: string }[] | null,

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
