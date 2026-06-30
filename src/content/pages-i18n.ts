import type { Locale } from '@/lib/i18n/config';
import { defaultLocale } from '@/lib/i18n/config';
import type { PageContent } from '@/lib/types';
import { aboutContent, homeContent, seedPages } from './pages-data';
import pagesEn from '@/lib/i18n/generated/pages.en.json';
import pagesDe from '@/lib/i18n/generated/pages.de.json';

/**
 * Page content translations (overlay model).
 *
 * Turkish is the canonical source (`aboutContent` / `homeContent` in
 * pages-data.ts). Each non-default locale supplies a DEEP-PARTIAL overlay that
 * mirrors the source shape and overrides only the strings that should be
 * translated. Structural / non-text fields — `href`, `icon`, `key`, the chef's
 * `name`, and team `members` (proper nouns) — are intentionally omitted from
 * overlays so they stay single-sourced.
 *
 * `getAboutContent()` / `getHomeContent()` deep-merge the overlay onto the TR
 * source. Anything an overlay omits falls back to Turkish, so the site is
 * always complete even before translations land.
 *
 * EN/DE overlays are produced by `pnpm i18n:translate` (DeepL) and MUST be
 * human-reviewed before publishing.
 */

type DeepPartial<T> = T extends readonly (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type AboutContent = typeof aboutContent;
export type HomeContent = typeof homeContent;

/** Combined per-locale payload as written by `pnpm i18n:translate`. */
interface PagesLocaleFile {
  about?: DeepPartial<AboutContent>;
  home?: DeepPartial<HomeContent>;
  seo?: Record<string, PageMetaOverlay>;
}

const en = pagesEn as PagesLocaleFile;
const de = pagesDe as PagesLocaleFile;

export const aboutTextByLocale: Record<Locale, DeepPartial<AboutContent>> = {
  tr: {},
  en: en.about ?? {},
  de: de.about ?? {},
};

export const homeTextByLocale: Record<Locale, DeepPartial<HomeContent>> = {
  tr: {},
  en: en.home ?? {},
  de: de.home ?? {},
};

/**
 * Recursively merge a deep-partial overlay onto a base value.
 * - Arrays: merged element-by-element (overlay[i] over base[i]); base length
 *   wins, so the overlay can translate items in place without dropping any.
 * - Objects: per-key recursive merge.
 * - Primitives: overlay value when defined, otherwise base.
 */
function deepMerge<T>(base: T, overlay: DeepPartial<T> | undefined): T {
  if (overlay === undefined) return base;

  if (Array.isArray(base)) {
    const ov = overlay as unknown[];
    return base.map((item, i) =>
      deepMerge(item, ov[i] as DeepPartial<typeof item> | undefined),
    ) as unknown as T;
  }

  if (base !== null && typeof base === 'object') {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    const ov = overlay as Record<string, unknown>;
    for (const key of Object.keys(result)) {
      result[key] = deepMerge(result[key], ov[key] as DeepPartial<unknown>);
    }
    return result as T;
  }

  return (overlay as unknown as T) ?? base;
}

export function getAboutContent(locale: Locale): AboutContent {
  if (locale === defaultLocale) return aboutContent;
  return deepMerge(aboutContent, aboutTextByLocale[locale]);
}

export function getHomeContent(locale: Locale): HomeContent {
  if (locale === defaultLocale) return homeContent;
  return deepMerge(homeContent, homeTextByLocale[locale]);
}

/**
 * Per-locale SEO/page-meta overlays keyed by slug. Only the translatable
 * fields (title, excerpt, seoTitle, seoDescription) are carried; the canonical
 * `seedPages` (TR) supplies slug/contentMd/ogImageUrl. Filled by the
 * translation pipeline; empty entries fall back to Turkish.
 */
type PageMetaOverlay = Partial<Pick<PageContent, 'title' | 'excerpt' | 'seoTitle' | 'seoDescription'>>;

export const seedPagesByLocale: Record<Locale, Record<string, PageMetaOverlay>> = {
  tr: {},
  en: en.seo ?? {},
  de: de.seo ?? {},
};

/** A single page's content for a locale (TR seed + locale overlay). */
export function getLocalPage(slug: string, locale: Locale): PageContent | null {
  const base = seedPages.find((page) => page.slug === slug) ?? null;
  if (!base || locale === defaultLocale) return base;

  const overlay = seedPagesByLocale[locale]?.[slug];
  if (!overlay) return base;

  return {
    ...base,
    title: overlay.title ?? base.title,
    excerpt: overlay.excerpt ?? base.excerpt,
    seoTitle: overlay.seoTitle ?? base.seoTitle,
    seoDescription: overlay.seoDescription ?? base.seoDescription,
  };
}
