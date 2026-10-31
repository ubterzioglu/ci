import { buildAiTxt } from '@/lib/seo/ai-discovery';

/** /.well-known/ai.txt — see lib/seo/ai-discovery.ts for what goes in it and why. */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return new Response(buildAiTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
