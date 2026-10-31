import { buildAiSummary } from '@/lib/seo/ai-discovery';

/** /ai/summary.json — see lib/seo/ai-discovery.ts for what goes in it and why. */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return Response.json(buildAiSummary(), {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400' },
  });
}
