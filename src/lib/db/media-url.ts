import { GALLERY_BUCKET } from '@/lib/db/admin/gallery-types';

/** The bits of a media_assets row needed to work out where the file lives. */
export interface MediaLocation {
  storagePath: string | null;
  sourceUrl?: string | null;
}

/** Minimal shape of a Supabase client that can build Storage public URLs. */
interface StorageUrlBuilder {
  storage: {
    from: (bucket: string) => { getPublicUrl: (path: string) => { data: { publicUrl: string } } };
  };
}

/**
 * Resolve a media_assets row to a URL the browser can load.
 *
 * `storage_path` holds one of two things and both are live:
 *
 * - an absolute path like `/images/imported/chef-simge.jpg` — a file committed
 *   under /public, which is what the seed writes
 * - a Storage object key like `gallery/1712...jpg` — what an upload through the
 *   admin panel writes
 *
 * Telling them apart by the leading slash keeps seeded rows and uploaded rows
 * in the same column. Returns null when there is nothing loadable, which every
 * caller already treats as "no image".
 *
 * Shared by the public gallery, the team photos and the single-image slots so
 * the three cannot disagree about what a row points at.
 */
export function mediaUrlFromRow(supabase: StorageUrlBuilder, row: MediaLocation): string | null {
  const { storagePath, sourceUrl } = row;

  if (storagePath) {
    if (storagePath.startsWith('/')) return storagePath;
    return supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath).data.publicUrl;
  }

  return sourceUrl?.trim() ? sourceUrl : null;
}

/** True when the path points at a committed file under /public rather than Storage. */
export function isPublicAssetPath(storagePath: string): boolean {
  return storagePath.startsWith('/');
}
