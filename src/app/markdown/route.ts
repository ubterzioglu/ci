import { buildLlmsTxt } from '@/lib/seo/llms-txt';

/**
 * Markdown rendition of the home page for clients that send
 * `Accept: text/markdown`. The proxy rewrites `/` here for those requests (see
 * proxy.ts); it is not linked anywhere and stays out of the index.
 */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex',
      Vary: 'Accept',
    },
  });
}
