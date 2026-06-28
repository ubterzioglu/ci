/**
 * Shared domain types for Çi Neo Cucina.
 *
 * These are the application-level shapes used across the UI and data layers.
 * They are intentionally decoupled from the generated Supabase row types so
 * the local content fallback and the database can satisfy the same interface.
 */

export type Locale = 'tr' | 'en' | 'de';

export const LOCALES: readonly Locale[] = ['tr', 'en', 'de'] as const;
export const DEFAULT_LOCALE: Locale = 'tr';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  /** Price in major currency units (e.g. 580 for ₺580). Null when "ask staff". */
  price: number | null;
  currency: string;
  imageUrl: string | null;
  tags: string[];
  allergens: string[];
  dietaryFlags: string[];
  sortOrder: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  items: MenuItem[];
}

export interface PageContent {
  slug: string;
  title: string;
  excerpt: string | null;
  contentMd: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
}

export interface MediaAsset {
  id: string;
  sourceUrl: string | null;
  storagePath: string | null;
  alt: string | null;
  title: string | null;
  context: string | null;
}

export interface ReservationInput {
  name: string;
  email?: string;
  phone?: string;
  partySize: number;
  requestedDate: string;
  requestedTime: string;
  message?: string;
}

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Result envelope returned by server actions to the client forms. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
