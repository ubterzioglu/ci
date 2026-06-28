import type { NextConfig } from 'next';

/**
 * Next.js configuration for Çi Neo Cucina.
 *
 * - All managed images now resolve to local files under
 *   `public/images/imported/` (every media asset in src/content/media-data.ts
 *   has a downloaded local copy — verified). The legacy Wix CDN remote patterns
 *   were therefore removed. If a future asset is added without running
 *   `pnpm assets:download`, re-add the host or download the file. See
 *   MIGRATION_NOTES.md and src/lib/images.ts.
 * - `redirects()` preserves SEO equity from the old Wix slugs (e.g. /about-1).
 *   Database-backed redirects are additionally served via middleware.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Produces a minimal self-contained server for Docker/Coolify deployment.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        // Legacy Wix slug for the About page.
        source: '/about-1',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
