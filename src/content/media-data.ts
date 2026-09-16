import type { MediaAsset } from '@/lib/types';

/**
 * Image manifest. Every asset is a committed local file under /public — the
 * site has no external image dependency. `storagePath` is that path; resolve
 * it through `resolveImage()` in src/lib/images.ts.
 *
 * Originally extracted from the Wix export; the remote CDN URLs were dropped
 * when the site left Wix. docs/ref/content/assets/image-assets.json keeps them
 * as the historical record.
 */
export const mediaAssets: MediaAsset[] = [
  {
    id: 'home-hero-table',
    storagePath: '/images/imported/home-hero-table.jpg',
    alt: 'Şarap ve tabaklarla hazırlanmış bir masa',
    title: 'Çi Neo Cucina masası',
    context: 'home',
  },
  {
    id: 'chef-simge',
    storagePath: '/images/imported/chef-simge.jpg',
    alt: 'Şef Simge Manacıoğlu portresi',
    title: 'Simge Manacıoğlu',
    context: 'home',
  },
  {
    id: 'restaurant-garden-night',
    storagePath: '/images/imported/restaurant-garden-night.jpg',
    alt: 'Zeytin ağaçları arasında akşam restoran bahçesi',
    title: 'Restoran bahçesi',
    context: 'home',
  },
  {
    id: 'flowers-pergola',
    storagePath: '/images/imported/flowers-pergola.jpg',
    alt: 'Çiçekli pergola',
    title: 'Pergola',
    context: 'gallery',
  },
  {
    id: 'gallery-sandwich',
    storagePath: '/images/imported/gallery-sandwich.jpg',
    alt: 'Sandviç ve içecek',
    title: 'Tabak detayı',
    context: 'gallery',
  },
  {
    id: 'gallery-slice-wine',
    storagePath: '/images/imported/gallery-slice-wine.jpg',
    alt: 'Masada bir dilim ve şarap',
    title: 'Şarap ve tabak',
    context: 'gallery',
  },
  {
    id: 'gallery-pasta',
    storagePath: '/images/imported/gallery-pasta.jpg',
    alt: 'Makarna ve beyaz şarap',
    title: 'Makarna',
    context: 'gallery',
  },
  {
    id: 'gallery-wine-close',
    storagePath: '/images/imported/gallery-wine-close.jpg',
    alt: 'Şarap kadehi yakın plan',
    title: 'Şarap kadehi',
    context: 'gallery',
  },
  {
    id: 'about-flowers',
    storagePath: '/images/imported/about-flowers.jpg',
    alt: 'Sarı ve beyaz çiçekler',
    title: 'Çiçekler',
    context: 'about',
  },
  {
    id: 'team-simge-lisa',
    storagePath: '/images/imported/team-simge-lisa.jpg',
    alt: 'Simge Manacıoğlu ve Lisa Rose',
    title: 'Ekip',
    context: 'about',
  },
  {
    id: 'kitchen-team',
    storagePath: '/images/imported/kitchen-team.jpg',
    alt: 'Mutfak ekibi',
    title: 'Mutfak ekibi',
    context: 'about',
  },
  {
    id: 'ci-family-2025',
    storagePath: '/images/imported/ci-family-2025.jpg',
    alt: '2025 Çi Ailesi',
    title: 'Çi Ailesi',
    context: 'about',
  },
  {
    id: 'menu-dilimleme-et',
    storagePath: '/images/imported/menu-meat.jpg',
    alt: 'Dilimlenmiş et tabağı',
    title: 'Menü görseli',
    context: 'menu',
  },
  // ---------------------------------------------------------------------------
  // Confirmed restaurant photos from the 2026 Wix export, optimised into
  // public/images/gallery/ as .webp. Those files are
  // committed.
  // (The export also contained Wix demo/template stock — a cap, an Eames chair,
  // jewellery — which was excluded as it is not restaurant content.)
  // ---------------------------------------------------------------------------
  {
    id: 'gallery-fish-melon',
    storagePath: '/images/gallery/gallery-fish-melon.webp',
    alt: 'Mavi kenarlı balık tabağında kavun ve otlarla servis edilen taze balık, yanında beyaz şarap',
    title: 'Mevsim tabağı',
    context: 'gallery',
  },
  {
    id: 'team-ci-sign',
    storagePath: '/images/gallery/gallery-team-sign.webp',
    alt: 'Çi Neo Cucina tabelasının önünde şef Simge Manacıoğlu ve ekip',
    title: 'Çi Ailesi',
    context: 'about',
  },
];

export function getMediaByContext(context: string) {
  return mediaAssets.filter((asset) => asset.context === context);
}

export function getMediaById(id: string) {
  return mediaAssets.find((asset) => asset.id === id) ?? null;
}
