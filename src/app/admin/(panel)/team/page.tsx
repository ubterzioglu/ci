import { AdminPageHeader, AdminEmptyState } from '@/components/admin/primitives';
import { listGalleryItems, ABOUT_CONTEXT, type AdminGalleryItem } from '@/lib/db/admin/gallery';
import { TeamClient } from './TeamClient';

/**
 * Team-photos management for the about page. Lists every about-context photo and
 * lets an admin upload/edit/delete them. Writes go through server actions that
 * revalidate /about, where the public team gallery reads the same source.
 */
export default async function TeamAdminPage() {
  let items: AdminGalleryItem[] = [];
  let loadError: string | null = null;

  try {
    items = await listGalleryItems(ABOUT_CONTEXT);
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : 'Fotoğraflar yüklenemedi. Supabase yapılandırmasını kontrol edin.';
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Ekip Fotoğrafları"
        description="Hakkımızda sayfasındaki ekip galerisini yönetin. Değişiklikler /about sayfasına yansır."
      />

      {loadError ? (
        <AdminEmptyState title="Fotoğraflar yüklenemedi" description={loadError} />
      ) : (
        <TeamClient initialItems={items} />
      )}
    </>
  );
}
