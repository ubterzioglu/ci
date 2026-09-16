import { deterministicUuid } from '@/lib/deterministic-id';

/**
 * The site's single, fixed images — the ones that are not a gallery.
 *
 * These used to be reachable only by editing src/content/media-data.ts: the
 * hero, the chef's portrait and the reservation banner were effectively frozen
 * once deployed. Each slot below is one editable position on the public site,
 * backed by the media_assets row the seed already creates for it.
 *
 * Kept free of `server-only` so the admin UI can render the list.
 */

export interface SiteImageSlot {
  /** Media id — matches src/content/media-data.ts and the seeded row. */
  id: string;
  /** Which admin page shows this slot. */
  page: 'home' | 'about';
  label: string;
  /** Plain-language note about every place it appears on the public site. */
  appearsOn: string;
  /** Tailwind aspect ratio for the admin preview. */
  aspectClassName: string;
}

export const SITE_IMAGE_SLOTS: readonly SiteImageSlot[] = [
  {
    id: 'restaurant-garden-night',
    page: 'home',
    label: 'Ana görsel (üst bölüm)',
    // One image, two sections — worth saying so before someone swaps it and is
    // surprised to see it change further down the page too.
    appearsOn: 'Ana sayfanın en üstünde ve "Deneyim" bölümünün arka planında',
    aspectClassName: 'aspect-[16/9]',
  },
  {
    id: 'home-hero-table',
    page: 'home',
    label: 'Rezervasyon bölümü arka planı',
    appearsOn: 'Ana sayfadaki rezervasyon çağrısının arkasında ve yönetim girişinde',
    aspectClassName: 'aspect-[16/9]',
  },
  {
    id: 'chef-simge',
    page: 'about',
    label: 'Şef portresi',
    appearsOn: 'Hakkımızda sayfasında ve ana sayfadaki şef/hikâye bölümlerinde',
    aspectClassName: 'aspect-[3/4]',
  },
] as const;

/** The slots shown on one admin page, in display order. */
export function slotsForPage(page: SiteImageSlot['page']): SiteImageSlot[] {
  return SITE_IMAGE_SLOTS.filter((slot) => slot.page === page);
}

export function findSlot(id: string): SiteImageSlot | undefined {
  return SITE_IMAGE_SLOTS.find((slot) => slot.id === id);
}

/** The media_assets row id a slot is stored in. */
export function slotRowId(slotId: string): string {
  return deterministicUuid(slotId);
}

/** A slot as the admin panel renders it. */
export interface SiteImageSlotView extends SiteImageSlot {
  /** Current image, or null when neither the database nor /public has one. */
  url: string | null;
  alt: string;
  /** False while the slot still shows the image shipped with the code. */
  isCustom: boolean;
}
