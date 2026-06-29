import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f2e9',
    theme_color: '#23211c',
    lang: 'tr',
    categories: ['food', 'restaurant', 'lifestyle'],
    icons: [
      // Scalable SVG covers any size for modern installers; the maskable
      // apple-icon (generated at /apple-icon) backs iOS home-screen saves.
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
