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
    '/': 'Çi Neo Cucina — Kaş’ta Akdeniz ve Anadolu Mutfağı Restoranı',
    '/menu': 'Menü — Kaş’ta Akdeniz ve Anadolu Mutfağı | Çi Neo Cucina',
    '/about': 'Hakkımızda — Kaş’ta Şef Mutfağı ve Hikâyemiz | Çi Neo Cucina',
    '/experiences': 'Deneyimler — Kaş’ta Chef’s Table, Özel Masa | Çi Neo Cucina',
    '/contact': 'İletişim & Adres — Kaş’ta Restoran | Çi Neo Cucina',
    '/reservations': 'Kaş’ta Masa Rezervasyonu — Talep Formu | Çi Neo Cucina',
  },
  en: {
    '/': 'Çi Neo Cucina — Mediterranean Restaurant in Kaş, Turkey',
    '/menu': 'Menu — Mediterranean Dining in Kaş | Çi Neo Cucina',
    '/about': 'About — Chef-Led Kitchen in Kaş, Turkey | Çi Neo Cucina',
    '/experiences': 'Experiences — Private Dining in Kaş | Çi Neo Cucina',
    '/contact': 'Contact & Directions to Our Kaş Restaurant | Çi Neo Cucina',
    '/reservations': 'Book a Table in Kaş — Reservation Request | Çi Neo Cucina',
  },
  de: {
    '/': 'Çi Neo Cucina — Mediterranes Restaurant in Kaş, Türkei',
    '/menu': 'Speisekarte — Mediterrane Küche in Kaş | Çi Neo Cucina',
    '/about': 'Über uns — Die Küche des Chefs in Kaş | Çi Neo Cucina',
    '/experiences': 'Erlebnisse — Private Dining in Kaş | Çi Neo Cucina',
    '/contact': 'Kontakt & Anfahrt zum Restaurant in Kaş | Çi Neo Cucina',
    '/reservations': 'Tisch reservieren in Kaş — Anfrage | Çi Neo Cucina',
  },
  ru: {
    '/': 'Çi Neo Cucina — средиземноморский ресторан в Каше, Турция',
    '/menu': 'Меню — кухня Средиземноморья в Каше | Çi Neo Cucina',
    '/about': 'О нас — авторская кухня шефа в Каше, Турция | Çi Neo Cucina',
    '/experiences': 'Впечатления — особые ужины в Каше, Турция | Çi Neo Cucina',
    '/contact': 'Контакты и адрес ресторана в Каше, Турция | Çi Neo Cucina',
    '/reservations': 'Бронирование столика в Каше, Турция | Çi Neo Cucina',
  },
  fr: {
    '/': 'Çi Neo Cucina — Restaurant méditerranéen à Kaş, Turquie',
    '/menu': 'Menu — Cuisine méditerranéenne à Kaş | Çi Neo Cucina',
    '/about': 'À propos — La cuisine du chef à Kaş | Çi Neo Cucina',
    '/experiences': 'Expériences — Chef’s Table et dîners à Kaş | Çi Neo Cucina',
    '/contact': 'Contact & accès au restaurant à Kaş | Çi Neo Cucina',
    '/reservations': 'Réserver une table à Kaş — Demande | Çi Neo Cucina',
  },
};

/** The absolute `<title>` for a public route in a given locale. */
export function seoTitle(route: TitledRoute, locale: Locale): string {
  return TITLES[locale][route];
}
