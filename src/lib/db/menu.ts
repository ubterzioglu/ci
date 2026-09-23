import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLocalMenu } from '@/content/menu-data';
import { getLocalWineMenu } from '@/content/wine-menu-data';
import {
  asMenuTranslations,
  localiseMenuText,
  DEFAULT_MENU_KIND,
  type MenuKind,
} from '@/lib/db/admin/menu-types';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import type { MenuCategory, MenuItem } from '@/lib/types';
import { localiseMenuTaxonomy } from '@/content/menu-i18n';

/**
 * Fetch the full menu (categories with nested active items) for a locale.
 *
 * Tries Supabase first; falls back to the local content files when Supabase is
 * not configured, errors, or has no categories — so the site always renders a
 * menu.
 *
 * Every locale reads the same rows. Turkish comes from the `name` /
 * `description` columns and the other languages from the `translations` jsonb
 * (004_menu_translations.sql), falling back field-by-field to Turkish where a
 * translation is missing or blank.
 *
 * This used to return the static local content for any non-default locale,
 * which meant nothing the restaurant did in /admin/menu — a new dish, a price
 * change — ever reached the EN/DE/RU menus.
 */
export async function getMenu(
  locale: Locale = defaultLocale,
  kind: MenuKind = DEFAULT_MENU_KIND,
): Promise<MenuCategory[]> {
  const localMenu = kind === DEFAULT_MENU_KIND ? getLocalMenu(locale) : getLocalWineMenu(locale);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return localMenu;

  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('id, name, slug, description, translations, sort_order')
    .eq('kind', kind)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (catError || !categories || categories.length === 0) {
    return localMenu;
  }

  const { data: items, error: itemError } = await supabase
    .from('menu_items')
    .select(
      'id, category_id, name, description, price, glass_price, is_coravin, currency, image_url, tags, allergens, dietary_flags, translations, sort_order',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (itemError) return localMenu;

  // Turkish is the source: its text already lives in the base columns.
  function translate(base: string, raw: unknown, field: 'name' | 'description'): string;
  function translate(
    base: string | null,
    raw: unknown,
    field: 'name' | 'description',
  ): string | null;
  function translate(
    base: string | null,
    raw: unknown,
    field: 'name' | 'description',
  ): string | null {
    if (locale === defaultLocale) return base;
    return localiseMenuText(base, asMenuTranslations(raw), locale, field);
  }

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const row of items ?? []) {
    const mapped: MenuItem = {
      id: row.id,
      name: translate(row.name, row.translations, 'name'),
      description: translate(row.description, row.translations, 'description'),
      price: row.price,
      glassPrice: row.glass_price,
      isCoravin: row.is_coravin,
      currency: row.currency,
      imageUrl: row.image_url,
      tags: (row.tags ?? []).map((tag) => localiseMenuTaxonomy(tag, locale)),
      allergens: (row.allergens ?? []).map((allergen) => localiseMenuTaxonomy(allergen, locale)),
      dietaryFlags: row.dietary_flags ?? [],
      sortOrder: row.sort_order,
    };
    const key = row.category_id ?? 'uncategorised';
    const bucket = itemsByCategory.get(key) ?? [];
    bucket.push(mapped);
    itemsByCategory.set(key, bucket);
  }

  const mappedCategories = categories.map((category) => ({
    id: category.id,
    name: translate(category.name, category.translations, 'name'),
    slug: category.slug,
    description: translate(category.description, category.translations, 'description'),
    sortOrder: category.sort_order,
    items: itemsByCategory.get(category.id) ?? [],
  }));

  // A deployment may have the wine categories from an earlier panel setup but
  // no entries yet. Keep the photographed list visible until database rows are
  // seeded; once at least one DB item exists, the database remains authoritative.
  if (kind === 'wine' && mappedCategories.every((category) => category.items.length === 0)) {
    return localMenu;
  }

  return mappedCategories;
}
