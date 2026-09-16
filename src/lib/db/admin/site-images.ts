import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getMediaById } from '@/content/media-data';
import { mediaUrlFromRow, isPublicAssetPath } from '@/lib/db/media-url';
import { GALLERY_BUCKET } from '@/lib/db/admin/gallery-types';
import {
  slotRowId,
  slotsForPage,
  type SiteImageSlot,
  type SiteImageSlotView,
} from '@/lib/media/site-image-slots';

/**
 * Admin data layer for the site's single fixed images (hero, chef portrait,
 * reservation banner).
 *
 * Each slot is one media_assets row, addressed by a uuid derived from its slug
 * so the seed and the panel always agree on which row that is. Replacing a
 * slot uploads the new file to the same Storage bucket the galleries use and
 * repoints the row at it; the file shipped under /public stays untouched and
 * remains the fallback.
 *
 * Gated by requireAdmin() in the calling action, so it uses the service-role
 * client. Throws on failure so the action can surface a message.
 */

function client() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  return supabase;
}

/** Every slot on one admin page, with whatever image it currently shows. */
export async function listSiteImageSlots(
  page: SiteImageSlot['page'],
): Promise<SiteImageSlotView[]> {
  const slots = slotsForPage(page);
  if (slots.length === 0) return [];

  const supabase = client();
  const { data, error } = await supabase
    .from('media_assets')
    .select('id, storage_path, source_url, alt')
    .in(
      'id',
      slots.map((slot) => slotRowId(slot.id)),
    );
  if (error) throw new Error(error.message);

  const rows = new Map((data ?? []).map((row) => [row.id, row]));

  return slots.map((slot) => {
    const row = rows.get(slotRowId(slot.id));
    const fallback = getMediaById(slot.id);

    const url = row
      ? mediaUrlFromRow(supabase, { storagePath: row.storage_path, sourceUrl: row.source_url })
      : null;

    // "Custom" means the row points into Storage rather than at the file that
    // ships with the site — which is exactly what an upload here produces.
    const isCustom = Boolean(row?.storage_path && !isPublicAssetPath(row.storage_path));

    return {
      ...slot,
      url: url ?? fallback?.storagePath ?? null,
      alt: row?.alt ?? fallback?.alt ?? '',
      isCustom,
    };
  });
}

export interface ReplaceSiteImageInput {
  slotId: string;
  bytes: ArrayBuffer;
  contentType: string;
  fileName: string;
  alt: string;
}

/**
 * Point a slot at a newly uploaded file.
 *
 * Upserts rather than updates: a slot whose row was never seeded (a locale or
 * install that skipped `pnpm db:seed`) must still be settable, otherwise the
 * panel would silently do nothing.
 */
export async function replaceSiteImage(input: ReplaceSiteImageInput): Promise<SiteImageSlotView> {
  const supabase = client();
  const rowId = slotRowId(input.slotId);

  const ext = extensionFor(input.contentType, input.fileName);
  const objectPath = `site/${input.slotId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(objectPath, input.bytes, { contentType: input.contentType, upsert: false });
  if (uploadError) throw new Error(`Yükleme başarısız: ${uploadError.message}`);

  const { data, error } = await supabase
    .from('media_assets')
    .upsert(
      {
        id: rowId,
        storage_path: objectPath,
        alt: input.alt,
        title: input.alt,
        context: 'site',
        mime_type: input.contentType,
        // No remote original: the site serves its own files.
        source_url: null,
      },
      { onConflict: 'id' },
    )
    .select('id, storage_path, source_url, alt')
    .single();

  if (error || !data) {
    // Best effort: do not leave the uploaded file orphaned in the bucket.
    await supabase.storage.from(GALLERY_BUCKET).remove([objectPath]);
    throw new Error(error?.message ?? 'Görsel kaydedilemedi.');
  }

  const slot = slotsForPage('home')
    .concat(slotsForPage('about'))
    .find((candidate) => candidate.id === input.slotId);
  if (!slot) throw new Error('Bilinmeyen görsel alanı.');

  return {
    ...slot,
    url: mediaUrlFromRow(supabase, {
      storagePath: data.storage_path,
      sourceUrl: data.source_url,
    }),
    alt: data.alt ?? '',
    isCustom: true,
  };
}

/** File extension for the stored object, trusting the MIME type over the name. */
function extensionFor(contentType: string, fileName: string): string {
  const byMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  if (byMime[contentType]) return byMime[contentType];
  const fromName = fileName.split('.').pop()?.toLowerCase();
  return fromName && /^[a-z0-9]{2,5}$/.test(fromName) ? fromName : 'jpg';
}
