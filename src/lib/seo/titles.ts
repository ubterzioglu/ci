import type { Locale } from '@/lib/i18n/config';

/**
 * Per-locale `<title>` tags for the public routes.
 *
 * Why these live here instead of coming from page content: the title is a
 * ranking and click-through surface, not body copy. "Kaş" is the single most
 * important token in it — somebody searching "Kaş restoran" or "restaurant
 * Kaş" needs to see the location in the result — and the generated page titles
 * ("Menü", "Menu", "Speisekarte") carry no location at all.
 *
 * These are ABSOLUTE titles: each string already contains the brand, and
 * buildMetadata appends nothing. That is what keeps them inside the ~60
 * characters Google renders before truncating; the generic
 * "<page> | Çi Neo Cucina" suffix would push most of them past it and bury the
 * location keyword.
 *
 * Keys are UNPREFIXED paths, matching the `path` passed to buildMetadata.
 *
 * NOTE: the RU and FR strings are translations awaiting a native review, like
 * the rest of those locales' content (see pages-i18n.ts). Fix the wording
 * here, not in the generated overlays.
 */

export type TitledRoute = '/' | '/menu' | '/about' | '/experiences' | '/contact' | '/reservations';

const TITLES: Record<Locale, Record<TitledRoute, string>> = {
  tr: {
    '/': 'Çi Neo Cucina — Kaş’ta Akdeniz & Anadolu Mutfağı',
    '/menu': 'Menü — Kaş’ta Akdeniz Mutfağı | Çi Neo Cucina',
    '/about': 'Hakkımızda — Kaş’ta Şef Mutfağı | Çi Neo Cucina',
    '/experiences': 'Deneyimler — Kaş’ta Özel Masa | Çi Neo Cucina',
    '/contact': 'İletişim & Adres — Kaş | Çi Neo Cucina',
    '/reservations': 'Kaş’ta Masa Rezervasyonu | Çi Neo Cucina',
  },
  en: {
    '/': 'Çi Neo Cucina — Mediterranean Restaurant in Kaş',
    '/menu': 'Menu — Mediterranean Dining in Kaş | Çi Neo Cucina',
    '/about': 'About — Chef-Led Kitchen in Kaş | Çi Neo Cucina',
    '/experiences': 'Experiences — Private Dining in Kaş | Çi Neo Cucina',
    '/contact': 'Contact & Directions in Kaş | Çi Neo Cucina',
    '/reservations': 'Book a Table in Kaş | Çi Neo Cucina',
  },
  de: {
    '/': 'Çi Neo Cucina — Mediterranes Restaurant in Kaş',
    '/menu': 'Speisekarte — Mediterran in Kaş | Çi Neo Cucina',
    '/about': 'Über uns — Küche des Chefs in Kaş | Çi Neo Cucina',
    '/experiences': 'Erlebnisse — Private Dining in Kaş | Çi Neo Cucina',
    '/contact': 'Kontakt & Anfahrt in Kaş | Çi Neo Cucina',
    '/reservations': 'Tisch reservieren in Kaş | Çi Neo Cucina',
  },
  ru: {
    '/': 'Çi Neo Cucina — ресторан в Каше, Турция',
    '/menu': 'Меню — кухня Средиземноморья в Каше | Çi Neo Cucina',
    '/about': 'О нас — кухня шефа в Каше | Çi Neo Cucina',
    '/experiences': 'Впечатления — особые ужины в Каше | Çi Neo Cucina',
    '/contact': 'Контакты и адрес в Каше | Çi Neo Cucina',
    '/reservations': 'Бронирование столика в Каше | Çi Neo Cucina',
  },
  fr: {
    '/': 'Çi Neo Cucina — Restaurant méditerranéen à Kaş',
    '/menu': 'Menu — Cuisine méditerranéenne à Kaş | Çi Neo Cucina',
    '/about': 'À propos — La cuisine du chef à Kaş | Çi Neo Cucina',
    '/experiences': 'Expériences — Dîners privés à Kaş | Çi Neo Cucina',
    '/contact': 'Contact & accès à Kaş | Çi Neo Cucina',
    '/reservations': 'Réserver une table à Kaş | Çi Neo Cucina',
  },
};

/** The absolute `<title>` for a public route in a given locale. */
export function seoTitle(route: TitledRoute, locale: Locale): string {
  return TITLES[locale][route];
}
