import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMediaByContext } from '@/content/media-data';
import { resolveImage } from '@/lib/images';
import { GALLERY_BUCKET, GALLERY_CONTEXT } from '@/lib/db/admin/gallery-types';

/** A gallery photo as the public site renders it. */
export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  /** Optional bottom-left caption overlay. */
  caption: string | null;
}

/**
 * Public "Atmosfer" gallery photos, in display order.
 *
 * Reads from Supabase (media_assets where context = 'gallery', newest order by
 * sort_order) when configured; falls back to the local hardcoded manifest so
 * the gallery always renders during development or if the DB is unreachable.
 * Mirrors the resilience pattern in src/lib/db/menu.ts.
 */
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('id, storage_path, source_url, alt, caption, sort_order')
      .eq('context', GALLERY_CONTEXT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data
        .map((row): GalleryPhoto | null => {
          const src = row.storage_path
            ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
            : (row.source_url ?? '');
          if (!src) return null;
          return {
            id: row.id,
            src,
            alt: row.alt ?? '',
            caption: row.caption,
          };
        })
        .filter((photo): photo is GalleryPhoto => photo !== null);
    }
  }

  // Fallback: the local hardcoded manifest (no captions there).
  return getMediaByContext(GALLERY_CONTEXT)
    .map((item): GalleryPhoto | null => {
      const image = resolveImage(item.id);
      if (!image) return null;
      return { id: item.id, src: image.src, alt: image.alt, caption: null };
    })
    .filter((photo): photo is GalleryPhoto => photo !== null);
}
