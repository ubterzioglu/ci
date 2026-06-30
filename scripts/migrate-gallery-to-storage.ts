/**
 * migrate-gallery-to-storage.ts — Upload local gallery/about images into the
 * Supabase `gallery` Storage bucket and repoint their media_assets rows.
 *
 * WHY: The seed (scripts/seed-supabase.ts) wrote each media_assets row with a
 * `storage_path` equal to the Next.js *public* path (e.g.
 * `/images/imported/flowers-pergola.jpg`). The public site
 * (src/lib/db/gallery.ts) turns a non-null `storage_path` into a Supabase
 * Storage public URL — but those files live in /public, NOT in the bucket, so
 * Storage returns 404 and the gallery shows broken images. This migration
 * uploads the real files into the bucket and rewrites `storage_path` to the
 * actual object key (e.g. `gallery/flowers-pergola.jpg`), which is what
 * getPublicUrl() expects and what next.config.ts already allows
 * (*.supabase.co/storage/v1/object/public/**).
 *
 * Usage:
 *   pnpm tsx scripts/migrate-gallery-to-storage.ts --dry-run   # preview only
 *   pnpm tsx scripts/migrate-gallery-to-storage.ts             # apply
 *   pnpm tsx scripts/migrate-gallery-to-storage.ts --force     # re-upload existing objects
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (service-role key bypasses RLS; server-side only). Idempotent: an object key
 * is derived deterministically from the file name, uploaded with upsert, and a
 * row is skipped if its storage_path already points at a bucket key.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const PUBLIC_DIR = join(process.cwd(), 'public');
const BUCKET = 'gallery';
/** Contexts whose images are served from the gallery bucket on the live site. */
const CONTEXTS = ['gallery', 'about'] as const;

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface MediaRow {
  id: string;
  context: string | null;
  storage_path: string | null;
  source_url: string | null;
  alt: string | null;
}

/**
 * A storage_path is already a bucket key (not a /public path) when it does NOT
 * start with a slash and is namespaced under one of our contexts, e.g.
 * `gallery/foo.webp`. The broken seed values look like `/images/imported/x.jpg`.
 */
function isBucketKey(storagePath: string): boolean {
  return !storagePath.startsWith('/') && CONTEXTS.some((c) => storagePath.startsWith(`${c}/`));
}

/** Deterministic, collision-free bucket key for a row's local file. */
function bucketKeyFor(context: string, storagePath: string): string {
  return `${context}/${basename(storagePath)}`;
}

async function main(): Promise<void> {
  console.log(
    `Gallery → Storage migration (bucket="${BUCKET}", dryRun=${DRY_RUN}, force=${FORCE})\n`,
  );

  const { data, error } = await supabase
    .from('media_assets')
    .select('id, context, storage_path, source_url, alt')
    .in('context', CONTEXTS as unknown as string[])
    .order('context', { ascending: true });

  if (error) {
    console.error(`✗ Could not read media_assets: ${error.message}`);
    process.exit(1);
  }

  const rows = (data ?? []) as MediaRow[];
  if (rows.length === 0) {
    console.log('No gallery/about rows found — nothing to do.');
    return;
  }

  let uploaded = 0;
  let repointed = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const label = `${row.context}/${row.alt ?? row.id}`;

    if (!row.storage_path) {
      console.log(`• skip ${label} (no storage_path; uses source_url)`);
      skipped++;
      continue;
    }

    if (isBucketKey(row.storage_path) && !FORCE) {
      console.log(`• skip ${label} (already a bucket key: ${row.storage_path})`);
      skipped++;
      continue;
    }

    // Resolve the local file from the original /public path. When --force is
    // used on an already-migrated row, fall back to deriving the public path
    // from the bucket key so re-uploads still find the source file.
    const publicRel = row.storage_path.startsWith('/')
      ? row.storage_path.replace(/^\//, '')
      : null;
    const localPath = publicRel ? join(PUBLIC_DIR, publicRel) : null;

    if (!localPath || !existsSync(localPath)) {
      console.error(
        `✗ ${label}: local file not found (${row.storage_path}). ` +
          'Run `pnpm assets:download` / `pnpm gallery:optimize` first.',
      );
      failed++;
      continue;
    }

    const ext = extname(localPath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
    const key = bucketKeyFor(row.context ?? 'gallery', row.storage_path);

    if (DRY_RUN) {
      console.log(`→ would upload ${localPath} → ${BUCKET}/${key} (${contentType})`);
      console.log(`  and set media_assets.storage_path = "${key}" for ${row.id}`);
      uploaded++;
      repointed++;
      continue;
    }

    const bytes = await readFile(localPath);
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, bytes, { contentType, upsert: true });

    if (upErr) {
      console.error(`✗ ${label}: upload failed — ${upErr.message}`);
      failed++;
      continue;
    }
    uploaded++;

    const { error: updErr } = await supabase
      .from('media_assets')
      .update({ storage_path: key, mime_type: contentType })
      .eq('id', row.id);

    if (updErr) {
      console.error(`✗ ${label}: row update failed — ${updErr.message}`);
      failed++;
      continue;
    }

    console.log(`✓ ${label} → ${BUCKET}/${key}`);
    repointed++;
  }

  console.log(
    `\nSummary: ${uploaded} uploaded, ${repointed} repointed, ${skipped} skipped, ${failed} failed.`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
