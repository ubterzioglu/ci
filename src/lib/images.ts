import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { getMediaById } from '@/content/media-data';
import { mediaUrlFromRow } from '@/lib/db/media-url';
import { slotRowId } from '@/lib/media/site-image-slots';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Resolve the URL for a managed image.
 *
 * Looks in the database first so a photo swapped in from /admin wins, and falls
 * back to the file committed under /public. That fallback is what keeps the
 * site whole: a slot nobody has ever touched still shows the image shipped with
 * the code, and so does every page if Supabase is unreachable.
 *
 * Returns `null` for an unknown id or a file that is not actually there, which
 * callers already treat as "no image" — better than emitting a src that cannot
 * load. There is deliberately no remote fallback beyond Supabase Storage:
 * next.config.ts allows no other image host.
 */
export async function resolveImage(id: string): Promise<{ src: string; alt: string } | null> {
  const fromDatabase = await resolveFromDatabase(id);
  if (fromDatabase) return fromDatabase;

  return resolveFromLocalManifest(id);
}

async function resolveFromDatabase(id: string): Promise<{ src: string; alt: string } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('media_assets')
    .select('storage_path, source_url, alt')
    .eq('id', slotRowId(id))
    .maybeSingle();

  if (error || !data) return null;

  const url = mediaUrlFromRow(supabase, {
    storagePath: data.storage_path,
    sourceUrl: data.source_url,
  });
  if (!url) return null;

  // A row can still point at a committed file (that is what the seed writes).
  // Verify it, so a stale row cannot put a 404 on the page where the local
  // manifest would have served something real.
  if (url.startsWith('/') && !publicFileExists(url)) return null;

  return { src: url, alt: data.alt ?? getMediaById(id)?.alt ?? '' };
}

function resolveFromLocalManifest(id: string): { src: string; alt: string } | null {
  const asset = getMediaById(id);
  if (!asset?.storagePath) return null;
  if (!publicFileExists(asset.storagePath)) return null;

  return { src: asset.storagePath, alt: asset.alt ?? '' };
}

function publicFileExists(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));
}
