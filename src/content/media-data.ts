import type { MediaAsset } from '@/lib/types';

/**
 * Image manifest — from the Wix export (ref/content/assets/image-assets.json).
 *
 * `sourceUrl` points at the legacy Wix CDN (allowed temporarily in
 * next.config.ts). `storagePath` is the local path under /public once
 * `pnpm assets:download` has run; until then the components fall back to
 * `sourceUrl`. See helpers in src/lib/images.ts.
 */
export const mediaAssets: (MediaAsset & { sourceUrl: string })[] = [
  {
    id: 'home-hero-table',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_400e50c345c04e429e6ada169aced9f8~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,enc_avif,quality_auto/31bec1_400e50c345c04e429e6ada169aced9f8~mv2.jpg',
    storagePath: '/images/imported/home-hero-table.jpg',
    alt: 'Şarap ve tabaklarla hazırlanmış bir masa',
    title: 'Çi Neo Cucina masası',
    context: 'home',
  },
  {
    id: 'chef-simge',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_30b1a2a8cb2742cab41f5fcc831a8c25~mv2.jpg/v1/fill/w_437,h_690,al_c,q_80,enc_avif,quality_auto/ER0A1854.jpg',
    storagePath: '/images/imported/chef-simge.jpg',
    alt: 'Şef Simge Manacıoğlu portresi',
    title: 'Simge Manacıoğlu',
    context: 'home',
  },
  {
    id: 'restaurant-garden-night',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_6f7ba707746440f084c5b7d1f3205765~mv2.jpg/v1/fill/w_980,h_622,al_c,q_85,enc_avif,quality_auto/31bec1_6f7ba707746440f084c5b7d1f3205765~mv2.jpg',
    storagePath: '/images/imported/restaurant-garden-night.jpg',
    alt: 'Zeytin ağaçları arasında akşam restoran bahçesi',
    title: 'Restoran bahçesi',
    context: 'home',
  },
  {
    id: 'flowers-pergola',
    sourceUrl:
      'https://static.wixstatic.com/media/11062b_4e53927ddddf4c0ea62e0b87954e44dcf000.jpg/v1/fill/w_980,h_551,al_c,q_85,enc_avif,quality_auto/11062b_4e53927ddddf4c0ea62e0b87954e44dcf000.jpg',
    storagePath: '/images/imported/flowers-pergola.jpg',
    alt: 'Çiçekli pergola',
    title: 'Pergola',
    context: 'gallery',
  },
  {
    id: 'gallery-sandwich',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_c368507c7c094332b65ed022da116afe~mv2.jpg/v1/fill/w_363,h_272,q_90,enc_avif,quality_auto/31bec1_c368507c7c094332b65ed022da116afe~mv2.jpg',
    storagePath: '/images/imported/gallery-sandwich.jpg',
    alt: 'Sandviç ve içecek',
    title: 'Tabak detayı',
    context: 'gallery',
  },
  {
    id: 'gallery-slice-wine',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_5706fefa718e4788afe01788b12c4cbf~mv2.jpg/v1/fill/w_362,h_272,q_90,enc_avif,quality_auto/31bec1_5706fefa718e4788afe01788b12c4cbf~mv2.jpg',
    storagePath: '/images/imported/gallery-slice-wine.jpg',
    alt: 'Masada bir dilim ve şarap',
    title: 'Şarap ve tabak',
    context: 'gallery',
  },
  {
    id: 'gallery-pasta',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_ac479a0a234249f18ba1b3c4636de6a4~mv2.jpg/v1/fill/w_363,h_272,q_90,enc_avif,quality_auto/31bec1_ac479a0a234249f18ba1b3c4636de6a4~mv2.jpg',
    storagePath: '/images/imported/gallery-pasta.jpg',
    alt: 'Makarna ve beyaz şarap',
    title: 'Makarna',
    context: 'gallery',
  },
  {
    id: 'gallery-wine-close',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_38e07d62976b4effbd3b1d98477364b3~mv2.jpg/v1/fill/w_362,h_272,q_90,enc_avif,quality_auto/31bec1_38e07d62976b4effbd3b1d98477364b3~mv2.jpg',
    storagePath: '/images/imported/gallery-wine-close.jpg',
    alt: 'Şarap kadehi yakın plan',
    title: 'Şarap kadehi',
    context: 'gallery',
  },
  {
    id: 'about-flowers',
    sourceUrl:
      'https://static.wixstatic.com/media/41f5e28a864c47548d5d6bc306d4299e.jpg/v1/fill/w_674,h_383,al_c,q_80,enc_avif,quality_auto/41f5e28a864c47548d5d6bc306d4299e.jpg',
    storagePath: '/images/imported/about-flowers.jpg',
    alt: 'Sarı ve beyaz çiçekler',
    title: 'Çiçekler',
    context: 'about',
  },
  {
    id: 'team-simge-lisa',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_8bb3956154944482af4f23aa76442d17~mv2.jpg/v1/fill/w_443,h_431,al_c,q_80,enc_avif,quality_auto/ER0A1914.jpg',
    storagePath: '/images/imported/team-simge-lisa.jpg',
    alt: 'Simge Manacıoğlu ve Lisa Rose',
    title: 'Ekip',
    context: 'about',
  },
  {
    id: 'kitchen-team',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_8bf12c4e60a74a7fa3bd3c88627ae46c~mv2.jpg/v1/fill/w_443,h_431,al_c,q_80,enc_avif,quality_auto/ER0A1776.jpg',
    storagePath: '/images/imported/kitchen-team.jpg',
    alt: 'Mutfak ekibi',
    title: 'Mutfak ekibi',
    context: 'about',
  },
  {
    id: 'ci-family-2025',
    sourceUrl:
      'https://static.wixstatic.com/media/31bec1_95444c27fb3d4ab897652886a4c93074~mv2.jpg/v1/fill/w_443,h_431,al_c,q_80,enc_avif,quality_auto/ER0A1801.jpg',
    storagePath: '/images/imported/ci-family-2025.jpg',
    alt: '2025 Çi Ailesi',
    title: 'Çi Ailesi',
    context: 'about',
  },
  {
    id: 'menu-dilimleme-et',
    sourceUrl:
      'https://static.wixstatic.com/media/11062b_c9f95ce7e79f4921b2af2d505d108281~mv2.jpg/v1/fill/w_714,h_476,al_c,q_80,enc_avif,quality_auto/11062b_c9f95ce7e79f4921b2af2d505d108281~mv2.jpg',
    storagePath: '/images/imported/menu-meat.jpg',
    alt: 'Dilimlenmiş et tabağı',
    title: 'Menü görseli',
    context: 'menu',
  },
];

export function getMediaByContext(context: string) {
  return mediaAssets.filter((asset) => asset.context === context);
}

export function getMediaById(id: string) {
  return mediaAssets.find((asset) => asset.id === id) ?? null;
}
