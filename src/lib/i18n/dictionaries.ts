/**
 * i18n/dictionaries.ts — UI-string dictionaries for Çi Neo Cucina
 *
 * Turkish (`tr`) is the canonical source. EN/DE are built by deep-merging the
 * generated overlays from `src/lib/i18n/generated/ui.{en,de}.json` (written by
 * `pnpm i18n:translate`, DeepL) over the TR base, so any string not yet
 * translated falls back to Turkish rather than shipping wrong or empty text.
 */

import type { Locale } from './config';
import { defaultLocale } from './config';
import uiEn from './generated/ui.en.json';
import uiDe from './generated/ui.de.json';

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

/** Canonical Turkish UI strings — the source for translation. */
const tr: Dictionary = {
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
};

type DictionaryOverlay = {
  [K in keyof Dictionary]?: Partial<Dictionary[K]>;
};

/** Build a locale dictionary by overlaying translated strings over TR. */
function withOverlay(overlay: DictionaryOverlay): Dictionary {
  return {
    nav: { ...tr.nav, ...overlay.nav },
    cta: { ...tr.cta, ...overlay.cta },
    common: { ...tr.common, ...overlay.common },
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en: withOverlay(uiEn as DictionaryOverlay),
  de: withOverlay(uiDe as DictionaryOverlay),
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
