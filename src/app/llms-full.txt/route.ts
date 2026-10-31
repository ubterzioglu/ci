import { buildLlmsFullTxt } from '@/lib/seo/llms-txt';

/** /llms-full.txt — see buildLlmsFullTxt in lib/seo/llms-txt.ts. */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
