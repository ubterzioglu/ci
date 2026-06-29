/**
 * Shared menu-admin types + constants. Kept free of `server-only` so both the
 * server data layer / actions and the client UI can import them. The actual
 * data-access functions live in menu.ts (server-only).
 *
 * These extend the public-facing MenuCategory / MenuItem (src/lib/types.ts)
 * with the admin-only fields the panel manages: is_active and (on categories)
 * the slug, plus the category each item belongs to.
 */

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
}

/** A category with its items, including inactive ones (admin view). */
export interface AdminMenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: AdminMenuItem[];
}

/* --- Write payloads --------------------------------------------------------- */

export interface CategoryInput {
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
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
}

/** {id, sortOrder} pairs used by the reorder actions. */
export interface SortOrderUpdate {
  id: string;
  sortOrder: number;
}

export const DEFAULT_CURRENCY = 'TRY';
