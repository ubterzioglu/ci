/**
 * Seed the Supabase database from the local content modules.
 *
 * Usage:
 *   pnpm db:seed
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Idempotent: upserts by natural keys (slug / key / source_path / id), so it
 * can be re-run safely. Uses the service-role key (server-side only).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

import { menuCategories } from '../src/content/menu-data.ts';
import { seedPages } from '../src/content/pages-data.ts';
import { mediaAssets } from '../src/content/media-data.ts';
import { siteConfig, mainNav } from '../src/lib/site-config.ts';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error(
    '✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedPagesTable() {
  const rows = seedPages.map((page, index) => ({
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content_md: page.contentMd,
    seo_title: page.seoTitle,
    seo_description: page.seoDescription,
    og_image_url: page.ogImageUrl,
    status: 'published',
    sort_order: index,
  }));
  const { error } = await supabase.from('pages').upsert(rows, { onConflict: 'slug' });
  if (error) throw new Error(`pages: ${error.message}`);
  console.log(`✓ pages: ${rows.length}`);
}

async function seedMenu() {
  // The local content uses human-readable slugs as ids; the database columns
  // are uuid, so derive stable uuids from those slugs (referential integrity
  // is preserved because items map their category through the same function).
  const categoryRows = menuCategories.map((category) => ({
    id: deterministicUuid(`category:${category.slug}`),
    name: category.name,
    slug: category.slug,
    description: category.description,
    sort_order: category.sortOrder,
    is_active: true,
  }));
  const { error: catError } = await supabase
    .from('menu_categories')
    .upsert(categoryRows, { onConflict: 'slug' });
  if (catError) throw new Error(`menu_categories: ${catError.message}`);
  console.log(`✓ menu_categories: ${categoryRows.length}`);

  const itemRows = menuCategories.flatMap((category) =>
    category.items.map((item) => ({
      id: deterministicUuid(`item:${item.id}`),
      category_id: deterministicUuid(`category:${category.slug}`),
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      image_url: item.imageUrl,
      tags: item.tags,
      allergens: item.allergens,
      dietary_flags: item.dietaryFlags,
      sort_order: item.sortOrder,
      is_active: true,
    })),
  );
  const { error: itemError } = await supabase
    .from('menu_items')
    .upsert(itemRows, { onConflict: 'id' });
  if (itemError) throw new Error(`menu_items: ${itemError.message}`);
  console.log(`✓ menu_items: ${itemRows.length}`);
}

async function seedMedia() {
  const rows = mediaAssets.map((asset) => ({
    id: deterministicUuid(asset.id),
    source_url: asset.sourceUrl,
    storage_path: asset.storagePath,
    alt: asset.alt,
    title: asset.title,
    context: asset.context,
  }));
  const { error } = await supabase.from('media_assets').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`media_assets: ${error.message}`);
  console.log(`✓ media_assets: ${rows.length}`);
}

async function seedSettings() {
  const rows = [
    { key: 'contact', value: siteConfig.contact, is_public: true },
    { key: 'navigation', value: mainNav, is_public: true },
    { key: 'brand', value: { name: siteConfig.name, hashtag: siteConfig.hashtag }, is_public: true },
    { key: 'reservation_note', value: { text: siteConfig.reservationNote }, is_public: true },
  ];
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(`site_settings: ${error.message}`);
  console.log(`✓ site_settings: ${rows.length}`);
}

async function seedRedirects() {
  const rows = [{ source_path: '/about-1', target_path: '/about', status_code: 301 }];
  const { error } = await supabase
    .from('redirects')
    .upsert(rows, { onConflict: 'source_path' });
  if (error) throw new Error(`redirects: ${error.message}`);
  console.log(`✓ redirects: ${rows.length}`);
}

/** Stable UUIDv5-ish derivation from a string (deterministic seed ids). */
function deterministicUuid(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  const hex = (Math.abs(h).toString(16) + '0'.repeat(32)).slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '5' + hex.slice(13, 16),
    '8' + hex.slice(17, 20),
    hex.slice(20, 32),
  ].join('-');
}

async function main() {
  console.log('Seeding Çi Neo Cucina database…');
  await seedSettings();
  await seedPagesTable();
  await seedMenu();
  await seedMedia();
  await seedRedirects();
  console.log('✓ Seed complete.');
}

main().catch((err) => {
  console.error('✗ Seed failed:', err.message);
  process.exit(1);
});
