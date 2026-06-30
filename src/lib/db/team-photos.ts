import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMediaByContext } from '@/content/media-data';
import { resolveImage } from '@/lib/images';
import { GALLERY_BUCKET, ABOUT_CONTEXT } from '@/lib/db/admin/gallery-types';

/**
 * A team photo as the public about page renders it: an image URL, alt text, and
 * an optional short caption shown beneath the photo.
 */
export interface TeamPhoto {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
}

/**
 * Fetch the about-page team photos.
 *
 * Mirrors the menu data layer's strategy (see src/lib/db/menu.ts): try Supabase
 * first (admin-managed photos in media_assets where context = 'about', read via
 * the public anon policy), and fall back to the bundled static manifest when
 * Supabase is not configured or returns nothing — so the gallery always renders.
 *
 * Static fallback items have no caption; the public component shows the editor's
 * member names list separately, matching the pre-existing about layout.
 */
export async function getTeamPhotos(): Promise<TeamPhoto[]> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('id, storage_path, source_url, alt, caption, sort_order')
      .eq('context', ABOUT_CONTEXT)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        url: row.storage_path
          ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
          : (row.source_url ?? ''),
        alt: row.alt ?? '',
        caption: row.caption ?? null,
      }));
    }
  }

  // Static fallback: the bundled about-context manifest entries.
  return getMediaByContext(ABOUT_CONTEXT)
    .map((asset): TeamPhoto | null => {
      const image = resolveImage(asset.id);
      if (!image) return null;
      return { id: asset.id, url: image.src, alt: image.alt, caption: null };
    })
    .filter((photo): photo is TeamPhoto => photo !== null);
}
