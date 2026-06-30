'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  type AdminGalleryItem,
} from '@/lib/db/admin/gallery';
import {
  ACCEPTED_IMAGE_TYPES,
  CAPTION_MAX_LENGTH,
  MAX_UPLOAD_BYTES,
} from '@/lib/db/admin/gallery-types';
import type { ActionResult } from '@/lib/types';

/**
 * Server actions for the gallery panel. Every action calls requireAdmin()
 * first, validates input with Zod (system-boundary validation), and revalidates
 * both the panel and the home page (where the public Gallery renders).
 */

const idSchema = z.string().uuid('Geçersiz kayıt.');

/** Optional caption: empty string → null; otherwise trimmed, ≤ max length. */
const captionSchema = z
  .string()
  .trim()
  .max(CAPTION_MAX_LENGTH, `Açıklama en fazla ${CAPTION_MAX_LENGTH} karakter olabilir.`)
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .transform((value) => value ?? null);

const altSchema = z
  .string()
  .trim()
  .min(1, 'Görsel açıklaması (alt metni) gerekli.')
  .max(300, 'Alt metni en fazla 300 karakter olabilir.');

/** Revalidate every surface a gallery change is visible on. */
function revalidateGallery(): void {
  revalidatePath('/admin/gallery');
  revalidatePath('/'); // home page hosts the public Gallery section
}

/* --- Create (upload) -------------------------------------------------------- */

export async function createGalleryItemAction(
  formData: FormData,
): Promise<ActionResult<AdminGalleryItem>> {
  await requireAdmin();

  const file = formData.get('file');
  const alt = formData.get('alt');
  const caption = formData.get('caption');

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Lütfen bir görsel dosyası seçin.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Dosya çok büyük (en fazla ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB).`,
    };
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { ok: false, error: 'Desteklenmeyen dosya türü (JPG, PNG, WebP veya AVIF kullanın).' };
  }

  const parsedAlt = altSchema.safeParse(alt);
  if (!parsedAlt.success) return { ok: false, error: firstError(parsedAlt.error) };

  const parsedCaption = captionSchema.safeParse(caption ?? '');
  if (!parsedCaption.success) return { ok: false, error: firstError(parsedCaption.error) };

  try {
    const item = await createGalleryItem({
      bytes: await file.arrayBuffer(),
      contentType: file.type,
      fileName: file.name,
      alt: parsedAlt.data,
      caption: parsedCaption.data,
    });
    revalidateGallery();
    return { ok: true, data: item };
  } catch (error) {
    return { ok: false, error: message(error, 'Fotoğraf eklenemedi.') };
  }
}

/* --- Update (alt + caption) ------------------------------------------------- */

const updateSchema = z.object({
  alt: altSchema,
  caption: captionSchema,
});

export async function updateGalleryItemAction(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  const parsed = updateSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: parsed.success ? 'Geçersiz kayıt.' : firstError(parsed.error) };
  }

  try {
    await updateGalleryItem(parsedId.data, parsed.data);
    revalidateGallery();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Güncellenemedi.') };
  }
}

/* --- Delete ----------------------------------------------------------------- */

export async function deleteGalleryItemAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Geçersiz kayıt.' };

  try {
    await deleteGalleryItem(parsed.data);
    revalidateGallery();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Silinemedi.') };
  }
}

/* --- Reorder ---------------------------------------------------------------- */

const reorderSchema = z
  .array(z.object({ id: idSchema, sortOrder: z.number().int().min(0) }))
  .max(500);

export async function reorderGalleryItemsAction(updates: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reorderSchema.safeParse(updates);
  if (!parsed.success) return { ok: false, error: 'Sıralama güncellenemedi.' };

  try {
    await reorderGalleryItems(parsed.data);
    revalidateGallery();
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
