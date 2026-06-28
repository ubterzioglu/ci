import fs from 'node:fs';
import path from 'node:path';

import { getMediaById } from '@/content/media-data';

/**
 * Resolve the best available URL for a managed image.
 *
 * Prefers the downloaded local file under /public (so production never depends
 * on the legacy Wix CDN). Falls back to the remote source URL when the local
 * file has not been downloaded yet. Returns `null` for unknown ids.
 */
export function resolveImage(id: string): { src: string; alt: string } | null {
  const asset = getMediaById(id);
  if (!asset) return null;

  const localExists =
    asset.storagePath &&
    fs.existsSync(path.join(process.cwd(), 'public', asset.storagePath.replace(/^\//, '')));

  const src = localExists ? asset.storagePath! : asset.sourceUrl;
  return { src, alt: asset.alt ?? '' };
}
