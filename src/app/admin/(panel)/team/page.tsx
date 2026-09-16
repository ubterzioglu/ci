import { AdminPageHeader, AdminEmptyState } from '@/components/admin/primitives';
import { SiteImageSlots } from '@/components/admin/SiteImageSlots';
import { listGalleryItems, ABOUT_CONTEXT, type AdminGalleryItem } from '@/lib/db/admin/gallery';
import { listSiteImageSlots } from '@/lib/db/admin/site-images';
import type { SiteImageSlotView } from '@/lib/media/site-image-slots';
import { TeamClient } from './TeamClient';

/**
 * Everything editable on the public ABOUT page: the "Ekibimiz" team photos
 * plus the chef portrait.
 *
 * Organised by public page, mirroring the home-page panel — see the note in
 * ../gallery/page.tsx.
 */
export default async function AboutImagesPage() {
  let items: AdminGalleryItem[] = [];
  let slots: SiteImageSlotView[] = [];
  let loadError: string | null = null;

  try {
    [items, slots] = await Promise.all([
      listGalleryItems(ABOUT_CONTEXT),
      listSiteImageSlots('about'),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : 'Fotoğraflar yüklenemedi. Supabase yapılandırmasını kontrol edin.';
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Hakkımızda"
        title="Hakkımızda Görselleri"
        description='Hakkımızda sayfasında görünen fotoğraflar. "Ekibimiz" bölümüne fotoğraf ekleyebilir, şef portresini değiştirebilirsiniz.'
      />

      <p className="font-body text-muted mb-6 text-sm">
        Buradaki değişiklikler{' '}
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="text-olive font-semibold underline-offset-2 hover:underline"
        >
          Hakkımızda sayfasında
        </a>{' '}
        görünür.
      </p>

      {loadError ? (
        <AdminEmptyState title="Fotoğraflar yüklenemedi" description={loadError} />
      ) : (
        <div className="space-y-6">
          <SiteImageSlots slots={slots} />
          <TeamClient initialItems={items} />
        </div>
      )}
    </>
  );
}
