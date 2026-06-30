import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  GALLERY_BUCKET,
  GALLERY_CONTEXT,
  type AdminGalleryItem,
  type GallerySortUpdate,
  type MediaContext,
} from './gallery-types';

/**
 * Admin data layer for the public "Atmosfer" gallery (media_assets where
 * context = 'gallery').
 *
 * The panel is gated by requireAdmin() (called first in every action), so these
 * use the service-role client which bypasses RLS — there is no Supabase user
 * session. Uploaded files live in the public `gallery` Storage bucket; their
 * metadata (alt, caption, sort_order) lives in public.media_assets. Functions
 * throw on failure so actions can surface a message.
 *
 * Types live in ./gallery-types (no `server-only`) so client components can
 * share them; re-exported here for convenience.
 */

export {
  GALLERY_BUCKET,
  GALLERY_CONTEXT,
  ABOUT_CONTEXT,
  CAPTION_MAX_LENGTH,
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  type AdminGalleryItem,
  type GallerySortUpdate,
  type MediaContext,
} from './gallery-types';

function client() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  return supabase;
}

/** Public URL for a stored gallery object. */
function publicUrl(storagePath: string): string {
  const { data } = client().storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/* --- Read ------------------------------------------------------------------ */

/** Every photo for a context, in display order (sort_order, then newest). */
export async function listGalleryItems(
  context: MediaContext = GALLERY_CONTEXT,
): Promise<AdminGalleryItem[]> {
  const supabase = client();

  const { data, error } = await supabase
    .from('media_assets')
    .select('id, storage_path, source_url, alt, caption, sort_order')
    .eq('context', context)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    storagePath: row.storage_path,
    // Storage path → public URL; fall back to a legacy absolute source_url.
    url: row.storage_path ? publicUrl(row.storage_path) : (row.source_url ?? ''),
    alt: row.alt ?? '',
    caption: row.caption,
    sortOrder: row.sort_order,
  }));
}

/* --- Create (upload) -------------------------------------------------------- */

export interface CreateGalleryInput {
  bytes: ArrayBuffer;
  contentType: string;
  /** Original filename — used only to derive a safe extension. */
  fileName: string;
  alt: string;
  caption: string | null;
}

/**
 * Upload an image file to the gallery bucket and insert its media_assets row.
 * The new item is appended to the end of the gallery order. On any failure
 * after the file lands, the orphaned object is best-effort removed so we don't
 * leak storage.
 */
export async function createGalleryItem(
  input: CreateGalleryInput,
  context: MediaContext = GALLERY_CONTEXT,
): Promise<AdminGalleryItem> {
  const supabase = client();

  // Derive the next sort order (append to the end).
  const { data: maxRow } = await supabase
    .from('media_assets')
    .select('sort_order')
    .eq('context', context)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxRow?.sort_order ?? -1) + 1;

  const ext = extensionFor(input.contentType, input.fileName);
  // A unique, collision-free object key, namespaced by context within the
  // shared bucket. Math.random/Date are fine server-side.
  const objectPath = `${context}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(objectPath, input.bytes, {
      contentType: input.contentType,
      upsert: false,
    });
  if (uploadError) throw new Error(`Yükleme başarısız: ${uploadError.message}`);

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      storage_path: objectPath,
      alt: input.alt,
      caption: input.caption,
      title: input.alt,
      context,
      mime_type: input.contentType,
      sort_order: nextSort,
    })
    .select('id, storage_path, source_url, alt, caption, sort_order')
    .single();

  if (error || !data) {
    // Roll back the orphaned upload (best effort).
    await supabase.storage.from(GALLERY_BUCKET).remove([objectPath]);
    throw new Error(error?.message ?? 'Kayıt oluşturulamadı.');
  }

  return {
    id: data.id,
    storagePath: data.storage_path,
    url: data.storage_path ? publicUrl(data.storage_path) : (data.source_url ?? ''),
    alt: data.alt ?? '',
    caption: data.caption,
    sortOrder: data.sort_order,
  };
}

/* --- Update (alt + caption) ------------------------------------------------- */

export interface UpdateGalleryInput {
  alt: string;
  caption: string | null;
}

export async function updateGalleryItem(
  id: string,
  input: UpdateGalleryInput,
  context: MediaContext = GALLERY_CONTEXT,
): Promise<void> {
  const supabase = client();
  const { error } = await supabase
    .from('media_assets')
    .update({ alt: input.alt, caption: input.caption })
    .eq('id', id)
    .eq('context', context);
  if (error) throw new Error(error.message);
}

/* --- Delete ----------------------------------------------------------------- */

/** Delete the row and its underlying Storage object (if any). */
export async function deleteGalleryItem(
  id: string,
  context: MediaContext = GALLERY_CONTEXT,
): Promise<void> {
  const supabase = client();

  const { data: row, error: readError } = await supabase
    .from('media_assets')
    .select('storage_path')
    .eq('id', id)
    .eq('context', context)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const { error: deleteError } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id)
    .eq('context', context);
  if (deleteError) throw new Error(deleteError.message);

  // Remove the file after the row is gone (best effort; an orphaned object is
  // harmless, a dangling row is not).
  if (row?.storage_path) {
    await supabase.storage.from(GALLERY_BUCKET).remove([row.storage_path]);
  }
}

/* --- Reorder ---------------------------------------------------------------- */

export async function reorderGalleryItems(
  updates: GallerySortUpdate[],
  context: MediaContext = GALLERY_CONTEXT,
): Promise<void> {
  const supabase = client();
  // Sequential updates keep this simple and within the small gallery size.
  for (const { id, sortOrder } of updates) {
    const { error } = await supabase
      .from('media_assets')
      .update({ sort_order: sortOrder })
      .eq('id', id)
      .eq('context', context);
    if (error) throw new Error(error.message);
  }
}

/* --- Helpers ---------------------------------------------------------------- */

function extensionFor(contentType: string, fileName: string): string {
  const byType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  if (byType[contentType]) return byType[contentType];
  const fromName = fileName.split('.').pop()?.toLowerCase();
  return fromName && /^[a-z0-9]{2,5}$/.test(fromName) ? fromName : 'jpg';
}
