import { AdminPageHeader, AdminEmptyState } from '@/components/admin/primitives';
import { listAdminMenu, type AdminMenuCategory } from '@/lib/db/admin/menu';
import { MenuClient } from './MenuClient';

/**
 * Menu management. Lists every category + item (including inactive ones) and
 * lets an admin add/edit/delete/reorder them. Writes go through server actions
 * that revalidate /menu and /qr, which both read the same getMenu() source.
 */
export default async function MenuAdminPage() {
  let categories: AdminMenuCategory[] = [];
  let loadError: string | null = null;

  try {
    categories = await listAdminMenu();
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : 'Menü yüklenemedi. Supabase yapılandırmasını kontrol edin.';
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Menü"
        description="Ürünleri ve kategorileri düzenleyin. Değişiklikler hem /menu sayfasına hem de masa QR menüsüne (/qr) yansır."
      />

      {loadError ? (
        <AdminEmptyState title="Menü yüklenemedi" description={loadError} />
      ) : (
        <MenuClient initialCategories={categories} />
      )}
    </>
  );
}
