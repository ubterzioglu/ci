/**
 * optimize-gallery.ts — Optimise selected raw Wix images into web-ready assets.
 *
 * Usage:
 *   pnpm gallery:optimize            # skip outputs that already exist
 *   pnpm gallery:optimize --force    # re-encode even if the output exists
 *
 * Reads full-resolution source images from the (gitignored) `wix/images/`
 * export and writes resized, compressed WebP files into
 * `public/images/gallery/`. Source files are 3000–6000px / multi-MB; outputs
 * are capped at MAX_WIDTH and quality QUALITY so they ship cheaply.
 *
 * IMPORTANT: This is an explicit ALLOWLIST, not a bulk convert. The raw export
 * also contains generic Wix demo/template stock (a man in a cap, an Eames
 * chair, jewellery shots) left over from the unconfigured Wix Store — those are
 * NOT restaurant content and are deliberately excluded. Add an entry here only
 * after visually confirming the image belongs to Çi Neo Cucina.
 *
 * Requires: sharp (devDependency). No network access — sources are local.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

const FORCE = process.argv.includes('--force');
const ROOT = process.cwd();
const SOURCE_DIR = join(ROOT, 'wix', 'images');
const OUTPUT_DIR = join(ROOT, 'public', 'images', 'gallery');

const MAX_WIDTH = 1600;
const QUALITY = 80;

interface GallerySource {
  /** Source filename under wix/images/ (verbatim, including ~mv2 + extension). */
  source: string;
  /** Output filename under public/images/gallery/ (stable, human-readable). */
  output: string;
}

/**
 * Confirmed Çi Neo Cucina photos from the 2026 Wix export. Each was visually
 * verified to depict the restaurant (dishes, team, brand), not Wix demo stock.
 * `id`/`alt`/`title`/`context` for these live in src/content/media-data.ts.
 */
const GALLERY_SOURCES: readonly GallerySource[] = [
  {
    source: '31bec1_230ba5e11d1a41779314245669ed5885~mv2.jpg',
    output: 'gallery-fish-melon.webp',
  },
  {
    source: '31bec1_ccd33b57e1eb4311ad4ed2341979896b~mv2.jpg',
    output: 'gallery-team-sign.webp',
  },
];

async function optimise(src: GallerySource): Promise<'done' | 'skipped' | 'failed'> {
  const inPath = join(SOURCE_DIR, src.source);
  const outPath = join(OUTPUT_DIR, src.output);

  if (!existsSync(inPath)) {
    console.error(`✗ ${src.output}: source missing (${src.source})`);
    return 'failed';
  }
  if (!FORCE && existsSync(outPath)) {
    console.log(`• ${src.output} (exists)`);
    return 'skipped';
  }

  try {
    const info = await sharp(inPath)
      .rotate() // respect EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);
    const kb = Math.round(info.size / 1024);
    console.log(`✓ ${src.output} (${info.width}×${info.height}, ${kb}KB)`);
    return 'done';
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`✗ ${src.output}: ${reason}`);
    return 'failed';
  }
}

async function main(): Promise<void> {
  if (!existsSync(SOURCE_DIR)) {
    console.error(
      `Source directory not found: ${SOURCE_DIR}\n` +
        'The raw Wix export (wix/) is gitignored. Re-run the export before optimising.',
    );
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Optimising ${GALLERY_SOURCES.length} image(s) (force=${FORCE})\n`);

  let done = 0;
  let skipped = 0;
  let failed = 0;
  for (const src of GALLERY_SOURCES) {
    const result = await optimise(src);
    if (result === 'done') done++;
    else if (result === 'skipped') skipped++;
    else failed++;
  }

  console.log(`\nSummary: ${done} optimised, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
