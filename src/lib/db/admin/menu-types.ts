/**
 * Shared menu-admin types + constants. Kept free of `server-only` so both the
 * server data layer / actions and the client UI can import them. The actual
 * data-access functions live in menu.ts (server-only).
 *
 * These extend the public-facing MenuCategory / MenuItem (src/lib/types.ts)
 * with the admin-only fields the panel manages: is_active and (on categories)
 * the slug, plus the category each item belongs to.
 */

import { translatableLocales, type TranslatableLocale } from '@/lib/i18n/config';

/* --- Translations ----------------------------------------------------------- */

/**
 * The translatable fields of a category or item. Turkish lives in the base
 * `name` / `description`; this carries the override for one other locale.
 * A blank or missing field falls back to Turkish at read time.
 */
// A type alias, not an interface: only aliases get an implicit index signature,
// which is what makes this assignable to the Supabase `Json` type at the write
// boundary without a cast.
export type MenuTranslation = {
  name?: string | null;
  description?: string | null;
};

/** Per-locale overrides, as stored in the `translations` jsonb column. */
export type MenuTranslations = Partial<Record<TranslatableLocale, MenuTranslation>>;

/**
 * Pick the text for a locale, falling back to the Turkish source whenever the
 * translation is absent or blank. Used by both the public read path and the
 * admin panel so they can never disagree about what a visitor sees.
 */
export function localiseMenuText(
  base: string,
  translations: MenuTranslations,
  locale: TranslatableLocale,
  field?: keyof MenuTranslation,
): string;
export function localiseMenuText(
  base: string | null,
  translations: MenuTranslations,
  locale: TranslatableLocale,
  field?: keyof MenuTranslation,
): string | null;
export function localiseMenuText(
  base: string | null,
  translations: MenuTranslations,
  locale: TranslatableLocale,
  field: keyof MenuTranslation = 'name',
): string | null {
  const translated = translations[locale]?.[field];
  return translated?.trim() ? translated : base;
}

/**
 * Narrow the `translations` jsonb into the typed shape.
 *
 * The column is only constrained to be a JSON object, so anything could be in
 * there — a row predating the column, or one written outside the panel. Keep
 * the locale entries whose fields are usable strings and drop the rest, so a
 * malformed row degrades to "no translation" (and falls back to Turkish)
 * rather than putting a non-string where the UI expects text.
 */
export function asMenuTranslations(value: unknown): MenuTranslations {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  const result: MenuTranslations = {};
  for (const locale of translatableLocales) {
    const entry = (value as Record<string, unknown>)[locale];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) continue;

    const { name, description } = entry as Record<string, unknown>;
    const translation: MenuTranslation = {};
    if (typeof name === 'string') translation.name = name;
    if (typeof description === 'string') translation.description = description;
    if (translation.name !== undefined || translation.description !== undefined) {
      result[locale] = translation;
    }
  }
  return result;
}

/** Dietary flags stored on menu_items.dietary_flags. */
export const DIETARY_FLAGS = ['vegan', 'vegetarian'] as const;
export type DietaryFlag = (typeof DIETARY_FLAGS)[number];

export const DIETARY_FLAG_LABELS: Record<DietaryFlag, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vejetaryen',
};

/**
 * Suggested allergens (free-form text[] in the DB; this list seeds the UI as
 * quick-pick chips, but admins may also type custom values).
 */
export const COMMON_ALLERGENS = [
  'gluten',
  'süt',
  'yumurta',
  'balık',
  'kabuklu deniz ürünü',
  'yumuşakça',
  'sert kabuklu yemiş',
  'fıstık',
  'soya',
  'susam',
] as const;

/** A menu item as the admin panel sees it (includes inactive + category link). */
export interface AdminMenuItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  /** Major currency units (e.g. 580 for ₺580). Null = "ask staff". */
  price: number | null;
  currency: string;
  tags: string[];
  allergens: string[];
  dietaryFlags: string[];
  sortOrder: number;
  isActive: boolean;
  translations: MenuTranslations;
}

/** A category with its items, including inactive ones (admin view). */
export interface AdminMenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  translations: MenuTranslations;
  items: AdminMenuItem[];
}

/* --- Write payloads --------------------------------------------------------- */

export interface CategoryInput {
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  translations: MenuTranslations;
}

export interface ItemInput {
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  tags: string[];
  allergens: string[];
  dietaryFlags: string[];
  isActive: boolean;
  translations: MenuTranslations;
}

/** {id, sortOrder} pairs used by the reorder actions. */
export interface SortOrderUpdate {
  id: string;
  sortOrder: number;
}

export const DEFAULT_CURRENCY = 'TRY';
