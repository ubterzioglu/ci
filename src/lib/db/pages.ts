import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { seedPages } from '@/content/pages-data';
import type { PageContent } from '@/lib/types';

/**
 * Fetch a single published page by slug. Falls back to local seed content when
 * Supabase is unavailable. Used primarily for SEO metadata; the page bodies
 * themselves are rendered from typed content modules for richer layouts.
 */
export async function getPage(slug: string): Promise<PageContent | null> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('pages')
      .select('slug, title, excerpt, content_md, seo_title, seo_description, og_image_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      return {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        contentMd: data.content_md,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        ogImageUrl: data.og_image_url,
      };
    }
  }

  return seedPages.find((page) => page.slug === slug) ?? null;
}

/** All published page slugs — used to build the sitemap. */
export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.from('pages').select('slug').eq('status', 'published');

    if (!error && data && data.length > 0) {
      return data.map((row) => row.slug);
    }
  }

  return seedPages.map((page) => page.slug);
}
