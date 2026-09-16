import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getLocalMenu } from '@/content/menu-data';
import { asMenuTranslations, localiseMenuText } from '@/lib/db/admin/menu-types';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import type { MenuCategory, MenuItem } from '@/lib/types';

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
export async function getMenu(locale: Locale = defaultLocale): Promise<MenuCategory[]> {
  const localMenu = getLocalMenu(locale);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return localMenu;

  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('id, name, slug, description, translations, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (catError || !categories || categories.length === 0) {
    return localMenu;
  }

  const { data: items, error: itemError } = await supabase
    .from('menu_items')
    .select(
      'id, category_id, name, description, price, currency, image_url, tags, allergens, dietary_flags, translations, sort_order',
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
      currency: row.currency,
      imageUrl: row.image_url,
      tags: row.tags ?? [],
      allergens: row.allergens ?? [],
      dietaryFlags: row.dietary_flags ?? [],
      sortOrder: row.sort_order,
    };
    const key = row.category_id ?? 'uncategorised';
    const bucket = itemsByCategory.get(key) ?? [];
    bucket.push(mapped);
    itemsByCategory.set(key, bucket);
  }

  return categories.map((category) => ({
    id: category.id,
    name: translate(category.name, category.translations, 'name'),
    slug: category.slug,
    description: translate(category.description, category.translations, 'description'),
    sortOrder: category.sort_order,
    items: itemsByCategory.get(category.id) ?? [],
  }));
}
