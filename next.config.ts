import type { NextConfig } from 'next';

/**
 * Next.js configuration for Çi Neo Cucina.
 *
 * - `remotePatterns` temporarily allows the legacy Wix CDN so the site renders
 *   while imported images are being migrated to `public/images/imported/`.
 *   Once `pnpm assets:download` has run and content references local paths,
 *   these remote patterns can be removed. See MIGRATION_NOTES.md.
 * - `redirects()` preserves SEO equity from the old Wix slugs (e.g. /about-1).
 *   Database-backed redirects are additionally served via middleware.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Produces a minimal self-contained server for Docker/Coolify deployment.
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: 'static.parastorage.com' },
    ],
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
