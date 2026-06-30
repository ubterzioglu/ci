import type { Locale } from '@/lib/i18n/config';
import menuEn from '@/lib/i18n/generated/menu.en.json';
import menuDe from '@/lib/i18n/generated/menu.de.json';

/**
 * Menu text translations (overlay model).
 *
 * The canonical menu structure — ids, prices, tags, allergens, sort order —
 * lives once in `menu-data.ts` as the Turkish source. This file carries ONLY
 * the translatable strings (item name + description, category name +
 * description) per non-default locale, keyed by the stable id from
 * `menu-data.ts`. `getLocalMenu()` merges an overlay onto the TR structure, so
 * prices and dietary data are never duplicated and can never drift between
 * languages.
 *
 * EN/DE values are produced by `pnpm i18n:translate` (DeepL) and MUST be
 * reviewed by a native speaker before publishing — restaurant terminology
 * (dish names, regional ingredients) often needs human correction. Any id left
 * out of an overlay falls back to the Turkish text.
 */

export interface MenuTextOverlay {
  /** Translated category name + description, keyed by category id. */
  categories: Record<string, { name?: string; description?: string }>;
  /** Translated item name + description, keyed by item id. */
  items: Record<string, { name?: string; description?: string }>;
}

/** Translatable menu notes (the TR originals live in menu-data.ts). */
export interface MenuNotesOverlay {
  serviceNote?: string;
  wineNotice?: string;
}

/** Combined per-locale payload as written by `pnpm i18n:translate`. */
interface MenuLocaleFile {
  categories?: Record<string, { name?: string; description?: string }>;
  items?: Record<string, { name?: string; description?: string }>;
  notes?: MenuNotesOverlay;
}

const en = menuEn as MenuLocaleFile;
const de = menuDe as MenuLocaleFile;

/**
 * Per-locale overlays. `tr` is intentionally empty (it is the source).
 * `en`/`de` are loaded from `src/lib/i18n/generated/menu.{en,de}.json`, which
 * the translation pipeline writes; before translations land the files are `{}`
 * so everything falls back to Turkish.
 */
export const menuTextByLocale: Record<Locale, MenuTextOverlay> = {
  tr: { categories: {}, items: {} },
  en: { categories: en.categories ?? {}, items: en.items ?? {} },
  de: { categories: de.categories ?? {}, items: de.items ?? {} },
};

export const menuNotesByLocale: Record<Locale, MenuNotesOverlay> = {
  tr: {},
  en: en.notes ?? {},
  de: de.notes ?? {},
};
