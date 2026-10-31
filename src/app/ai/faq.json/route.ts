import { buildAiFaq } from '@/lib/seo/ai-discovery';

/** /ai/faq.json — the home-page FAQ in every locale; see lib/seo/ai-discovery.ts. */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return Response.json(buildAiFaq(), {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400' },
  });
}
