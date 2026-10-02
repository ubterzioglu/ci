import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * robots.txt.
 *
 * `/impressum` and `/datenschutz` are deliberately NOT disallowed even though
 * they are noindex: a disallowed URL is never fetched, so the noindex meta tag
 * is never read, and an externally linked page can still end up indexed as a
 * bare URL with no description. Crawlable + noindex is what actually keeps
 * them out of the index.
 *
 * Only genuinely non-public surfaces are disallowed: the API routes and the
 * admin panel.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;
  const privatePaths = ['/api/', '/admin/'];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: privatePaths },
      /**
       * Retrieval bots behind AI assistants — the crawlers that fetch and cite
       * pages live when someone asks ChatGPT, Perplexity or Claude for a
       * restaurant in Kaş. These must stay open: blocking them removes the
       * restaurant from generative answers entirely.
       *
       * Model-TRAINING bots (GPTBot, ClaudeBot, Google-Extended,
       * Applebot-Extended, CCBot) are a separate, business decision and are
       * NOT listed here, so they fall through to the `*` rule and are allowed.
       * Disallowing them would not affect the retrieval bots above.
       */
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Perplexity-User',
          'Claude-SearchBot',
          'Claude-User',
        ],
        allow: '/',
        disallow: privatePaths,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
