import fs from 'node:fs';
import path from 'node:path';

import { getMediaById } from '@/content/media-data';

/**
 * Resolve the URL for a managed image.
 *
 * Every managed asset is a committed file under /public, so this only has to
 * confirm the file is actually there. Returns `null` for an unknown id or a
 * missing file, which callers already treat as "no image" — better than
 * emitting a src that cannot load.
 *
 * There is deliberately no remote fallback: the site left Wix and
 * next.config.ts allows no image host but Supabase Storage.
 */
export function resolveImage(id: string): { src: string; alt: string } | null {
  const asset = getMediaById(id);
  if (!asset?.storagePath) return null;

  const localPath = path.join(process.cwd(), 'public', asset.storagePath.replace(/^\//, ''));
  if (!fs.existsSync(localPath)) return null;

  return { src: asset.storagePath, alt: asset.alt ?? '' };
}
