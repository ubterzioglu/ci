import type { NextConfig } from 'next';

/**
 * Next.js configuration for Çi Neo Cucina.
 *
 * - Managed images are committed files under `public/images/imported/`; the
 *   site depends on no external image host. A new asset must be committed to
 *   /public — `resolveImage()` (src/lib/images.ts) returns null for a missing
 *   file rather than reaching out to a remote.
 * - `redirects()` preserves SEO equity from the old site's slugs (e.g. /about-1).
 *   Database-backed redirects are additionally served via middleware.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Produces a minimal self-contained server for Docker/Coolify deployment.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    // Gallery photos uploaded via /admin/gallery are served from Supabase
    // Storage's public bucket (https://<project-ref>.supabase.co/storage/...).
    // Allow any Supabase project host so this survives a project/ref change.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
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
