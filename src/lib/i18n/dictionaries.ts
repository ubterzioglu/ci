/**
 * i18n/dictionaries.ts — UI-string dictionaries for Çi Neo Cucina
 *
 * EN and DE entries are intentionally set to the Turkish source values for
 * now so the app is localization-ready without shipping wrong translations.
 *
 * TODO: translate via pnpm i18n:translate
 *   Once reviewed translations are available, replace the placeholder values
 *   below with the approved strings from src/lib/i18n/generated/.
 */

import type { Locale } from './config';
import { defaultLocale } from './config';

// ---------------------------------------------------------------------------
// Dictionary shape
// ---------------------------------------------------------------------------

export interface Dictionary {
  nav: {
    home: string;
    menu: string;
    about: string;
    experiences: string;
    reservations: string;
    contact: string;
  };
  cta: {
    reserve: string;
  };
  common: {
    phone: string;
    email: string;
  };
}

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

export const dictionaries: Record<Locale, Dictionary> = {
  tr: {
    nav: {
      home: 'Ana Sayfa',
      menu: 'Menü',
      about: 'Hakkımızda',
      experiences: 'Deneyimler',
      reservations: 'Rezervasyon',
      contact: 'İletişim',
    },
    cta: {
      reserve: 'Rezervasyon Talep Et',
    },
    common: {
      phone: 'Telefon',
      email: 'E-posta',
    },
  },

  // TODO: translate via pnpm i18n:translate
  en: {
    nav: {
      home: 'Ana Sayfa',
      menu: 'Menü',
      about: 'Hakkımızda',
      experiences: 'Deneyimler',
      reservations: 'Rezervasyon',
      contact: 'İletişim',
    },
    cta: {
      reserve: 'Rezervasyon Talep Et',
    },
    common: {
      phone: 'Telefon',
      email: 'E-posta',
    },
  },

  // TODO: translate via pnpm i18n:translate
  de: {
    nav: {
      home: 'Ana Sayfa',
      menu: 'Menü',
      about: 'Hakkımızda',
      experiences: 'Deneyimler',
      reservations: 'Rezervasyon',
      contact: 'İletişim',
    },
    cta: {
      reserve: 'Rezervasyon Talep Et',
    },
    common: {
      phone: 'Telefon',
      email: 'E-posta',
    },
  },
};

// ---------------------------------------------------------------------------
// Accessor
// ---------------------------------------------------------------------------

/**
 * Returns the dictionary for the given locale, falling back to Turkish if
 * the locale is not found (should not happen when callers use `isLocale()`).
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
