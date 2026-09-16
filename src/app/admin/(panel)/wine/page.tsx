import { AdminPageHeader, AdminEmptyState } from '@/components/admin/primitives';
import { listAdminMenu, type AdminMenuCategory } from '@/lib/db/admin/menu';
import { MenuClient } from '../menu/MenuClient';

/**
 * Wine list management — the same editor as the food menu, pointed at the
 * 'wine' categories.
 *
 * The wine list has the same shape as the food menu (categories holding priced
 * entries), so it reuses MenuClient wholesale: the four-language fields, the
 * translate buttons, ordering and show/hide all come along unchanged.
 */
export default async function WineAdminPage() {
  let categories: AdminMenuCategory[] = [];
  let loadError: string | null = null;

  try {
    categories = await listAdminMenu('wine');
  } catch (error) {
    loadError =
      error instanceof Error && error.message
        ? error.message
        : 'Şarap menüsü yüklenemedi. Supabase yapılandırmasını kontrol edin.';
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Şarap Menüsü"
        description="Şarap kategorilerini (örn. Beyaz, Kırmızı, Rosé) ve şarapları düzenleyin. Değişiklikler /menu sayfasındaki “Şarap Menüsü” sekmesinde görünür."
      />

      {loadError ? (
        <AdminEmptyState title="Şarap menüsü yüklenemedi" description={loadError} />
      ) : (
        <MenuClient initialCategories={categories} kind="wine" />
      )}
    </>
  );
}
