'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createItem,
  updateItem,
  setItemActive,
  deleteItem,
  reorderItems,
  reorderCategories,
  type AdminMenuCategory,
  type AdminMenuItem,
} from '@/lib/db/admin/menu';
import { DIETARY_FLAGS } from '@/lib/db/admin/menu-types';
import type { ActionResult } from '@/lib/types';

/**
 * Server actions for menu management. Every action calls requireAdmin() first,
 * validates input with Zod (system-boundary validation), and revalidates BOTH
 * public surfaces — /menu and /qr share getMenu(), so a write must refresh both.
 */

const idSchema = z.string().uuid('Geçersiz kayıt.');

/** Revalidate every surface a menu change is visible on. */
function revalidateMenu(): void {
  revalidatePath('/admin/menu');
  revalidatePath('/menu');
  revalidatePath('/qr');
}

/* --- Categories ------------------------------------------------------------ */

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Kategori adı gerekli.').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug gerekli.')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug sadece küçük harf, rakam ve tire içerebilir.'),
  description: z.string().trim().max(2000).nullable(),
  isActive: z.boolean(),
});

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<AdminMenuCategory>> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }

  try {
    const category = await createCategory(parsed.data);
    revalidateMenu();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: message(error, 'Kategori eklenemedi.') };
  }
}

export async function updateCategoryAction(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  const parsed = categorySchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: parsed.success ? 'Geçersiz kayıt.' : firstError(parsed.error) };
  }

  try {
    await updateCategory(parsedId.data, parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Kategori güncellenemedi.') };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Geçersiz kayıt.' };

  try {
    await deleteCategory(parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    // deleteCategory throws a user-facing message when the category still has items.
    return { ok: false, error: message(error, 'Kategori silinemedi.') };
  }
}

/* --- Items ----------------------------------------------------------------- */

const itemSchema = z.object({
  categoryId: idSchema,
  name: z.string().trim().min(1, 'Ürün adı gerekli.').max(200),
  description: z.string().trim().max(2000).nullable(),
  price: z.number().min(0, 'Fiyat negatif olamaz.').max(1_000_000).nullable(),
  currency: z.string().trim().min(1).max(8),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  allergens: z.array(z.string().trim().min(1).max(60)).max(30),
  dietaryFlags: z.array(z.enum(DIETARY_FLAGS)).max(DIETARY_FLAGS.length),
  isActive: z.boolean(),
});

export async function createItemAction(input: unknown): Promise<ActionResult<AdminMenuItem>> {
  await requireAdmin();

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }

  try {
    const item = await createItem(parsed.data);
    revalidateMenu();
    return { ok: true, data: item };
  } catch (error) {
    return { ok: false, error: message(error, 'Ürün eklenemedi.') };
  }
}

export async function updateItemAction(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  const parsed = itemSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: parsed.success ? 'Geçersiz kayıt.' : firstError(parsed.error) };
  }

  try {
    await updateItem(parsedId.data, parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Ürün güncellenemedi.') };
  }
}

export async function toggleItemActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();

  const parsed = z.object({ id: idSchema, isActive: z.boolean() }).safeParse({ id, isActive });
  if (!parsed.success) return { ok: false, error: 'Geçersiz kayıt.' };

  try {
    await setItemActive(parsed.data.id, parsed.data.isActive);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Durum güncellenemedi.') };
  }
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Geçersiz kayıt.' };

  try {
    await deleteItem(parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Ürün silinemedi.') };
  }
}

/* --- Reordering ------------------------------------------------------------ */

const reorderSchema = z.array(z.object({ id: idSchema, sortOrder: z.number().int().min(0) })).max(500);

export async function reorderItemsAction(updates: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reorderSchema.safeParse(updates);
  if (!parsed.success) return { ok: false, error: 'Sıralama güncellenemedi.' };

  try {
    await reorderItems(parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Sıralama güncellenemedi.') };
  }
}

export async function reorderCategoriesAction(updates: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reorderSchema.safeParse(updates);
  if (!parsed.success) return { ok: false, error: 'Sıralama güncellenemedi.' };

  try {
    await reorderCategories(parsed.data);
    revalidateMenu();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Sıralama güncellenemedi.') };
  }
}

/* --- Error helpers --------------------------------------------------------- */

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Lütfen formdaki hataları düzeltin.';
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
