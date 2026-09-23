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
import { DIETARY_FLAGS, MENU_KINDS, type MenuTranslations } from '@/lib/db/admin/menu-types';
import { translatableLocales, type TranslatableLocale } from '@/lib/i18n/config';
import { translateFromTurkish, TranslationError } from '@/lib/i18n/translate';
import type { ActionResult } from '@/lib/types';

/**
 * Server actions for menu management. Every action calls requireAdmin() first,
 * validates input with Zod (system-boundary validation), and revalidates BOTH
 * public surfaces — /menu and /qr share getMenu(), so a write must refresh both.
 */

const idSchema = z.string().uuid('Geçersiz kayıt.');

/**
 * Per-locale name/description overrides. Every locale is optional and every
 * field within one may be blank — a blank falls back to the Turkish source at
 * read time, so a half-translated row is valid on purpose.
 *
 * Keyed off `translatableLocales`, so adding a language to the site is accepted
 * here without touching this schema. Unknown keys are rejected rather than
 * stored, which keeps junk out of the jsonb column.
 */
const translationEntrySchema = z.object({
  name: z.string().trim().max(120).nullish(),
  description: z.string().trim().max(2000).nullish(),
});

// partialRecord, not record: an enum-keyed z.record demands every locale, but a
// row translated into only some languages is the normal case here.
const translationsSchema: z.ZodType<MenuTranslations> = z
  .partialRecord(z.enum(translatableLocales), translationEntrySchema)
  .default({});

/** Revalidate every surface a menu change is visible on. */
function revalidateMenu(): void {
  revalidatePath('/admin/menu');
  revalidatePath('/admin/wine');
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
  translations: translationsSchema,
  // Which menu the category belongs to; the panel sends it, so a wine category
  // can never be created into the food menu by accident.
  kind: z.enum(MENU_KINDS),
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
  glassPrice: z.number().min(0, 'Kadeh fiyatı negatif olamaz.').max(1_000_000).nullable(),
  isCoravin: z.boolean(),
  currency: z.string().trim().min(1).max(8),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  allergens: z.array(z.string().trim().min(1).max(60)).max(30),
  dietaryFlags: z.array(z.enum(DIETARY_FLAGS)).max(DIETARY_FLAGS.length),
  isActive: z.boolean(),
  translations: translationsSchema,
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

const reorderSchema = z
  .array(z.object({ id: idSchema, sortOrder: z.number().int().min(0) }))
  .max(500);

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

/* --- Translation ----------------------------------------------------------- */

const translateSchema = z.object({
  name: z.string().trim().max(2000),
  description: z.string().trim().max(4000),
});

/** What the panel gets back: the Turkish input rendered in every other locale. */
export type TranslatedFields = Record<TranslatableLocale, { name: string; description: string }>;

/**
 * Translate a menu row's Turkish name + description into every other locale.
 *
 * Powers both the per-field "TR'den çevir" buttons and the "Türkçeden Tümünü
 * Çevir" button. Pure — it returns the translations and writes nothing, so the
 * restaurant can review and edit them before saving the row.
 *
 * Blank inputs stay blank rather than being sent to DeepL, which keeps an
 * item with no description from burning quota on an empty string.
 */
export async function translateMenuFieldsAction(
  input: unknown,
): Promise<ActionResult<TranslatedFields>> {
  await requireAdmin();

  const parsed = translateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const { name, description } = parsed.data;
  if (!name && !description) {
    return { ok: false, error: 'Çevrilecek Türkçe metin yok. Önce TR alanlarını doldurun.' };
  }

  // One request per locale, each carrying only the non-empty fields.
  const fields = (
    [
      ['name', name],
      ['description', description],
    ] as const
  ).filter(([, value]) => value.length > 0);

  try {
    const perLocale = await Promise.all(
      translatableLocales.map(async (locale) => {
        const translated = await translateFromTurkish(
          fields.map(([, value]) => value),
          locale,
        );
        const result = { name: '', description: '' };
        fields.forEach(([key], index) => {
          result[key] = translated[index] ?? '';
        });
        return [locale, result] as const;
      }),
    );

    return { ok: true, data: Object.fromEntries(perLocale) as TranslatedFields };
  } catch (error) {
    if (error instanceof TranslationError) return { ok: false, error: error.message };
    return { ok: false, error: message(error, 'Çeviri yapılamadı.') };
  }
}
