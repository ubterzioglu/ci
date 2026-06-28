import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { menuCategories as localMenu } from '@/content/menu-data';
import type { MenuCategory, MenuItem } from '@/lib/types';

/**
 * Fetch the full menu (categories with nested active items).
 *
 * Tries Supabase first; falls back to local content when Supabase is not
 * configured or the query fails (so the site always renders a menu).
 */
export async function getMenu(): Promise<MenuCategory[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return localMenu;

  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('id, name, slug, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (catError || !categories || categories.length === 0) {
    return localMenu;
  }

  const { data: items, error: itemError } = await supabase
    .from('menu_items')
    .select(
      'id, category_id, name, description, price, currency, image_url, tags, allergens, dietary_flags, sort_order',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (itemError) return localMenu;

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const row of items ?? []) {
    const mapped: MenuItem = {
      id: row.id,
      name: row.name,
      description: row.description,
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
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sort_order,
    items: itemsByCategory.get(category.id) ?? [],
  }));
}
