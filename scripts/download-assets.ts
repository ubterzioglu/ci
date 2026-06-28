/**
 * download-assets.ts — Download all Wix CDN images to public/images/imported/
 *
 * Usage:
 *   pnpm assets:download           # skip files that already exist
 *   pnpm assets:download --force   # re-download even if the file exists
 *
 * Requires: tsx (devDependency). No network credentials needed — URLs are public.
 */

import { mkdirSync, existsSync, createWriteStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { mediaAssets } from '../src/content/media-data.ts';

const FORCE = process.argv.includes('--force');
const PUBLIC_DIR = join(process.cwd(), 'public');
const OUTPUT_DIR = join(PUBLIC_DIR, 'images', 'imported');

mkdirSync(OUTPUT_DIR, { recursive: true });

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(destPath, Buffer.from(buffer))
  );
}

async function main(): Promise<void> {
  const downloadable = mediaAssets.filter(
    (a) => a.sourceUrl && a.storagePath
  );

  if (downloadable.length === 0) {
    console.log('No assets with sourceUrl + storagePath found — nothing to do.');
    return;
  }

  console.log(`Processing ${downloadable.length} asset(s) (force=${FORCE})\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of downloadable) {
    // storagePath starts with '/', e.g. '/images/imported/foo.jpg'
    const relativePath = asset.storagePath!.replace(/^\//, '');
    const destPath = join(PUBLIC_DIR, relativePath);

    mkdirSync(dirname(destPath), { recursive: true });

    if (!FORCE && existsSync(destPath)) {
      console.log(`• skipped ${asset.id} (exists)`);
      skipped++;
      continue;
    }

    try {
      await downloadFile(asset.sourceUrl!, destPath);
      console.log(`✓ downloaded ${asset.id}`);
      downloaded++;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error(`✗ failed ${asset.id}: ${reason}`);
      failed++;
    }
  }

  console.log(
    `\nSummary: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed.`
  );

  if (failed > 0 && failed === downloadable.length) {
    // All assets failed — signal a hard failure
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
