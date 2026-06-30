'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  ABOUT_CONTEXT,
  type AdminGalleryItem,
} from '@/lib/db/admin/gallery';
import {
  ACCEPTED_IMAGE_TYPES,
  CAPTION_MAX_LENGTH,
  MAX_UPLOAD_BYTES,
} from '@/lib/db/admin/gallery-types';
import type { ActionResult } from '@/lib/types';

/**
 * Server actions for the team-photos panel — the about-page (context = 'about')
 * counterpart of the gallery actions. Same upload/validate/revalidate shape,
 * reusing the shared context-parametric data layer. Every action calls
 * requireAdmin() first and validates input with Zod at the boundary.
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

/** Revalidate every surface a team-photo change is visible on. */
function revalidateTeam(): void {
  revalidatePath('/admin/team');
  revalidatePath('/about'); // the about page hosts the public team gallery
}

/* --- Create (upload) -------------------------------------------------------- */

export async function createTeamPhotoAction(
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
    const item = await createGalleryItem(
      {
        bytes: await file.arrayBuffer(),
        contentType: file.type,
        fileName: file.name,
        alt: parsedAlt.data,
        caption: parsedCaption.data,
      },
      ABOUT_CONTEXT,
    );
    revalidateTeam();
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

export async function updateTeamPhotoAction(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  const parsed = updateSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: parsed.success ? 'Geçersiz kayıt.' : firstError(parsed.error) };
  }

  try {
    await updateGalleryItem(parsedId.data, parsed.data, ABOUT_CONTEXT);
    revalidateTeam();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Güncellenemedi.') };
  }
}

/* --- Delete ----------------------------------------------------------------- */

export async function deleteTeamPhotoAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Geçersiz kayıt.' };

  try {
    await deleteGalleryItem(parsed.data, ABOUT_CONTEXT);
    revalidateTeam();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error, 'Silinemedi.') };
  }
}

/* --- Error helpers --------------------------------------------------------- */

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Lütfen formdaki hataları düzeltin.';
}

function message(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
