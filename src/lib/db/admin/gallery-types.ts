/**
 * Shared gallery-admin types + constants. Kept free of `server-only` so both
 * the server data layer / actions and the client UI can import them. The actual
 * data-access functions live in gallery.ts (server-only).
 *
 * A gallery item is a row of public.media_assets with context = 'gallery'. The
 * admin panel manages the uploaded image (stored in the Supabase `gallery`
 * Storage bucket), its alt text, an optional short caption (shown bottom-left
 * on the public site), and the display order.
 */

/** Storage bucket that holds uploaded gallery image files. */
export const GALLERY_BUCKET = 'gallery';

/** The context tag that marks a media asset as part of the public gallery. */
export const GALLERY_CONTEXT = 'gallery';

/** The context tag for the about-page team photos (same Storage bucket). */
export const ABOUT_CONTEXT = 'about';

/** A media context the admin gallery tooling can manage. */
export type MediaContext = typeof GALLERY_CONTEXT | typeof ABOUT_CONTEXT;

/** Max length of the bottom-left caption overlay. Enforced in Zod + the DB. */
export const CAPTION_MAX_LENGTH = 40;

/** Accepted upload formats. */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

/** Max upload size in bytes (8 MB). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** A gallery photo as the admin panel sees it. */
export interface AdminGalleryItem {
  id: string;
  /** Public URL to render the image (Storage public URL or legacy source). */
  url: string;
  /** Storage object path within the bucket, when the file lives in Storage. */
  storagePath: string | null;
  alt: string;
  /** Optional bottom-left overlay text (≤ CAPTION_MAX_LENGTH). */
  caption: string | null;
  sortOrder: number;
}

/** {id, sortOrder} pairs used by the reorder action. */
export interface GallerySortUpdate {
  id: string;
  sortOrder: number;
}
