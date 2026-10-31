import { buildAtomFeed } from '@/lib/seo/feed';

/** /feed.xml — see lib/seo/feed.ts for what goes in it and why. */

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET(): Response {
  return new Response(buildAtomFeed(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
