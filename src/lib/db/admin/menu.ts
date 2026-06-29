import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type {
  AdminMenuCategory,
  AdminMenuItem,
  CategoryInput,
  ItemInput,
  SortOrderUpdate,
} from './menu-types';

/**
 * Admin data layer for the menu (categories + items).
 *
 * The panel is gated by requireAdmin() (which runs first in every action), so
 * these use the service-role client which bypasses RLS — there is no Supabase
 * user session. The public menu tables (001_initial_schema.sql) have READ-only
 * RLS for anon/authenticated and NO write policies, so writes can only happen
 * here via the service role. Functions throw on failure so actions can surface
 * a message.
 *
 * Unlike getMenu() (src/lib/db/menu.ts, public site), these list inactive rows
 * too so the admin can toggle visibility.
 *
 * Types live in ./menu-types (no `server-only`) so client components can share
 * them; re-exported here for convenience.
 */

export type {
  AdminMenuCategory,
  AdminMenuItem,
  CategoryInput,
  ItemInput,
  SortOrderUpdate,
} from './menu-types';

function client() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  return supabase;
}

/* --- Read ------------------------------------------------------------------ */

/**
 * Full admin menu: every category (active + inactive) with its items nested,
 * both ordered by sort_order. Items with no category are dropped from this view
 * (the panel always assigns a category on create).
 */
export async function listAdminMenu(): Promise<AdminMenuCategory[]> {
  const supabase = client();

  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('id, name, slug, description, sort_order, is_active')
    .order('sort_order', { ascending: true });
  if (catError) throw new Error(catError.message);

  const { data: items, error: itemError } = await supabase
    .from('menu_items')
    .select(
      'id, category_id, name, description, price, currency, tags, allergens, dietary_flags, sort_order, is_active',
    )
    .order('sort_order', { ascending: true });
  if (itemError) throw new Error(itemError.message);

  const itemsByCategory = new Map<string, AdminMenuItem[]>();
  for (const row of items ?? []) {
    if (!row.category_id) continue;
    const mapped: AdminMenuItem = {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: row.price,
      currency: row.currency,
      tags: row.tags ?? [],
      allergens: row.allergens ?? [],
      dietaryFlags: row.dietary_flags ?? [],
      sortOrder: row.sort_order,
      isActive: row.is_active,
    };
    const bucket = itemsByCategory.get(row.category_id) ?? [];
    bucket.push(mapped);
    itemsByCategory.set(row.category_id, bucket);
  }

  return (categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sort_order,
    isActive: c.is_active,
    items: itemsByCategory.get(c.id) ?? [],
  }));
}

/* --- Categories ------------------------------------------------------------ */

export async function createCategory(input: CategoryInput): Promise<AdminMenuCategory> {
  const supabase = client();

  // Place new categories at the end.
  const nextSort = await nextCategorySort();

  const { data, error } = await supabase
    .from('menu_categories')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      is_active: input.isActive,
      sort_order: nextSort,
    })
    .select('id, name, slug, description, sort_order, is_active')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Kategori eklenemedi.');

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    sortOrder: data.sort_order,
    isActive: data.is_active,
    items: [],
  };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const supabase = client();
  const { error } = await supabase
    .from('menu_categories')
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      is_active: input.isActive,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/**
 * Deletes a category. menu_items.category_id is `on delete set null`, so a
 * delete would orphan items (they vanish from the admin view, which hides
 * null-category items). Guard against that: refuse if the category still has
 * items.
 */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = client();

  const { count, error: countError } = await supabase
    .from('menu_items')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error('Bu kategoride ürün var. Önce ürünleri taşıyın veya silin.');
  }

  const { error } = await supabase.from('menu_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* --- Items ----------------------------------------------------------------- */

export async function createItem(input: ItemInput): Promise<AdminMenuItem> {
  const supabase = client();
  const nextSort = await nextItemSort(input.categoryId);

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      currency: input.currency,
      tags: input.tags,
      allergens: input.allergens,
      dietary_flags: input.dietaryFlags,
      is_active: input.isActive,
      sort_order: nextSort,
    })
    .select(
      'id, category_id, name, description, price, currency, tags, allergens, dietary_flags, sort_order, is_active',
    )
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Ürün eklenemedi.');

  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency,
    tags: data.tags ?? [],
    allergens: data.allergens ?? [],
    dietaryFlags: data.dietary_flags ?? [],
    sortOrder: data.sort_order,
    isActive: data.is_active,
  };
}

export async function updateItem(id: string, input: ItemInput): Promise<void> {
  const supabase = client();
  const { error } = await supabase
    .from('menu_items')
    .update({
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      currency: input.currency,
      tags: input.tags,
      allergens: input.allergens,
      dietary_flags: input.dietaryFlags,
      is_active: input.isActive,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setItemActive(id: string, isActive: boolean): Promise<void> {
  const supabase = client();
  const { error } = await supabase.from('menu_items').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = client();
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* --- Reordering ------------------------------------------------------------ */

/** Persist a new sort order for a set of items (one update per row). */
export async function reorderItems(updates: SortOrderUpdate[]): Promise<void> {
  const supabase = client();
  for (const { id, sortOrder } of updates) {
    const { error } = await supabase
      .from('menu_items')
      .update({ sort_order: sortOrder })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}

/** Persist a new sort order for a set of categories. */
export async function reorderCategories(updates: SortOrderUpdate[]): Promise<void> {
  const supabase = client();
  for (const { id, sortOrder } of updates) {
    const { error } = await supabase
      .from('menu_categories')
      .update({ sort_order: sortOrder })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}

/* --- Helpers --------------------------------------------------------------- */

/** Next sort_order for appending a category (global max + 1). */
async function nextCategorySort(): Promise<number> {
  const supabase = client();
  const { data } = await supabase
    .from('menu_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}

/**
 * Next sort_order for appending an item, scoped to its category (so each
 * category numbers its items from its own max). Falls back to the global max
 * when no category is given.
 */
async function nextItemSort(categoryId: string | null): Promise<number> {
  const supabase = client();
  let query = supabase
    .from('menu_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  const { data } = await query;
  return (data?.[0]?.sort_order ?? 0) + 1;
}
