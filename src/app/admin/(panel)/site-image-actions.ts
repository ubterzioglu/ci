'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import { replaceSiteImage } from '@/lib/db/admin/site-images';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/db/admin/gallery-types';
import { findSlot, type SiteImageSlotView } from '@/lib/media/site-image-slots';
import type { ActionResult } from '@/lib/types';

/**
 * Replacing one of the site's fixed images (hero, chef portrait, reservation
 * banner). Shared by the home and about photo panels.
 *
 * Validates at the boundary like the gallery actions do, then revalidates every
 * public surface the slot can appear on — one image can show in more than one
 * place, so a narrow revalidate would leave a stale copy behind.
 */

const uploadSchema = z.object({
  slotId: z.string().min(1),
  alt: z.string().trim().min(1, 'Alt metni gerekli.').max(300),
});

export async function replaceSiteImageAction(
  formData: FormData,
): Promise<ActionResult<SiteImageSlotView>> {
  await requireAdmin();

  const parsed = uploadSchema.safeParse({
    slotId: formData.get('slotId'),
    alt: formData.get('alt'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Geçersiz bilgi.' };
  }

  const slot = findSlot(parsed.data.slotId);
  if (!slot) return { ok: false, error: 'Bilinmeyen görsel alanı.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Bir görsel seçin.' };
  }
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: 'Sadece JPEG, PNG, WebP veya AVIF yükleyebilirsiniz.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Dosya çok büyük (en fazla 8 MB).' };
  }

  try {
    const updated = await replaceSiteImage({
      slotId: slot.id,
      bytes: await file.arrayBuffer(),
      contentType: file.type,
      fileName: file.name,
      alt: parsed.data.alt,
    });

    // A slot can surface on several pages (the hero image also backs the
    // "Deneyim" section; the chef portrait appears on the home page too), so
    // refresh both public pages and the panel rather than guessing.
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/gallery');
    revalidatePath('/admin/team');

    return { ok: true, data: updated };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Görsel değiştirilemedi.',
    };
  }
}
